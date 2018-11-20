const DEFAULT_OPTIONS = {
  cacheSize: 500,
  maxConcurrentDownloads: 10
};

// static callback for use when preloading images.
const PRELOAD_CB = function () {};

/**
 * This class caches images locally during a browser session,
 * and ensures that images are not reloaded from the network
 * as users scroll around. It can also preload images in advance.
 */
export class ImageCache {
  constructor(options) {
    this.options = Object.assign({}, DEFAULT_OPTIONS, options);

    this._cache = new Map;
    this._callbacks = {};
    this._xhr = {};
    this._queue = [];
    this._active = 0;
  }

  _loadImage(url, options, callback) {
    // If the image is already loading, just add the callback
    if (this._callbacks[url]) {
      this._callbacks[url].add(callback);
      return;
    }

    // Save callback, and enqueue the url to load.
    this._callbacks[url] = new Set([callback]);
    this._enqueue(this._load.bind(this, url, options));
  }

  _enqueue(fn) {
    this._queue.push(fn);
    this._runQueue();
  }

  _runQueue() {
    // Run items from the queue until we reach the maximum concurrency limit
    while (this._queue.length > 0 && this._active < this.options.maxConcurrentDownloads) {
      let fn = this._queue.shift();
      this._active++;
      fn(() => {
        this._active--;
        this._runQueue();
      });
    }
  }

  async _load(url, options, callback) {
    if (!this._callbacks[url]) {
      callback();
      return;
    }

    let xhr = new XMLHttpRequest;
    xhr.open('GET', url);
    xhr.responseType = 'blob';

    if (options.headers) {
      for (let key in options.headers) {
        xhr.setRequestHeader(key, options.headers[key]);
      }
    }

    xhr.addEventListener('load', () => {
      let blobURL = URL.createObjectURL(xhr.response);
      this.set(url, blobURL);
      this._callback(url, null, blobURL);
      callback();
    });

    xhr.addEventListener('error', (err) => {
      this._callback(url, err);
      callback();
    });

    xhr.addEventListener('abort', () => {
      callback();
    });

    this._xhr[url] = xhr;
    xhr.send();
  }

  _callback(url, err, blobURL) {
    for (var callback of this._callbacks[url]) {
      callback(err, blobURL);
    }

    delete this._callbacks[url];
    delete this._xhr[url];
  }

  set(url, blobURL) {
    // If the cache exceeds the maximum, delete the first key in the map,
    // which corresponds to the least recently used item.
    if (this._cache.size >= this.options.cacheSize) {
      let toDelete = this._cache.keys().next().value;
      this.delete(toDelete);
    }

    this._cache.set(url, blobURL);
  }

  delete(url) {
    let blobURL = this._cache.get(url);
    if (blobURL) {
      URL.revokeObjectURL(blobURL);
      this._cache.delete(url);
    }
  }

  /**
   * Checks whether an image URL exists in the cache.
   */
  has(url) {
    return this._cache.has(url);
  }

  /**
   * Gets a blob URL for an image if it exists already in the cache.
   */
  getCached(url) {
    let blobURL = this._cache.get(url);
    if (blobURL) {
      // re-insert the blob url at the end of the map for LRU eviction strategy.
      this._cache.delete(url);
      this._cache.set(url, blobURL);
    }

    return blobURL;
  }

  /**
   * Gets a blob url for an image and calls the callback. If the image is not already cached, 
   * it will be queued and loaded.
   * @param {string} url
   * @param {?object} options
   * @param {function} callback
   */
  get(url, options, callback) {
    if (typeof options === 'function') {
      callback = options;
      options = {};
    }

    if (/^blob:/.test(url)) {
      return callback(null, url);
    }

    var blobURL = this.getCached(url);
    if (blobURL) {
      return callback(null, blobURL);
    }

    this._loadImage(url, options, callback);
  }

  /**
   * Aborts loading an image by URL for the provided callback function.
   */
  abort(url, callback) {
    // Ignore if this url is not currently loading, or the callback wasn't found.
    if (!this._callbacks[url] || !this._callbacks[url].has(callback)) {
      return;
    }

    // Delete the callback from the list. If it is the last one, continue.
    this._callbacks[url].delete(callback);
    if (this._callbacks[url].size > 0) {
      return;
    }

    // Abort the request, if one is in progress.
    if (this._xhr[url]) {
      this._xhr[url].abort();
      delete this._xhr[url];
    }

    delete this._callbacks[url];
  }

  /**
   * Queues an image to be preloaded
   */
  preload(url) {
    this.get(url, PRELOAD_CB);
  }

  /**
   * Aborts an image preload
   */
  abortPreload(url) {
    this.abort(url, PRELOAD_CB);
  }
}

export default new ImageCache;
