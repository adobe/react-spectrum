// https://gist.github.com/rvaiya/4a2192df729056880a027789ae3cd4b7
// Author: Raheman Vaiya
// License: WTFPL

// Generate the crc32 table instead of hardcoding it to avoid having a giant constant
// in the minified output...
const CRC32_TABLE = function () {
  let tbl = new Int32Array(256);
  let c: number;
  for (let n = 0; n < 256; n++) {
    c = n;
    for (let k = 0; k < 8; k++) {
      c = ((c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1));
    }

    tbl[n] = c;
  }

  return tbl;
}();

function crc32(arr: Uint8Array) {
  let crc = -1;
  for (let i = 0; i < arr.length; i++) {
    crc = (crc >>> 8) ^ CRC32_TABLE[(crc ^ arr[i]) & 0xFF];
  }
  return (crc ^ (-1)) >>> 0;
}

function putUint32s(arr: Uint8Array, offset: number, ...values: number[]) {
  let dv = new DataView(arr.buffer);
  values.forEach((v, i) => dv.setUint32(offset + i * 4, v, true));
}

function putUint16s(arr: Uint8Array, offset: number, ...values: number[]) {
  let dv = new DataView(arr.buffer);
  values.forEach((v, i) => dv.setUint16(offset + i * 2, v, true));
}

export function zip(files: {[name: string]: string}): Blob {
  let records: Uint8Array[] = [];
  let cdrs: Uint8Array[] = [];
  let te = new TextEncoder();

  let offset = 0;
  let cdSz = 0;

  for (let name in files) {
    let fh = new Uint8Array(30 + name.length);
    let fname = te.encode(name);
    let data = te.encode(files[name]);
    let chksum = crc32(data);

    putUint32s(fh, 0, 0x04034b50);
    putUint32s(fh, 14, chksum, data.length, data.length);
    putUint16s(fh, 26, name.length);

    fh.set(fname, 30);

    records.push(fh);
    records.push(data);

    // Create CD records pending flush at the end...
    let cdr = new Uint8Array(46 + name.length);

    putUint32s(cdr, 0, 0x02014b50);
    putUint32s(cdr, 16, chksum, data.length, data.length);
    putUint16s(cdr, 28, name.length);
    putUint32s(cdr, 42, offset);

    cdr.set(fname, 46);
    cdrs.push(cdr);

    cdSz += cdr.length;
    offset += fh.length + data.length;
  }

  // Push all accrued CD records..
  records.push(...cdrs);
		
  // Add EOCD record...
  let eocd = new Uint8Array(22);
  putUint32s(eocd, 0, 0x06054b50);
  putUint16s(eocd, 8, cdrs.length, cdrs.length);
  putUint32s(eocd, 12, cdSz, offset);
  records.push(eocd);

  return new Blob(records as BlobPart[], {type: 'application/zip'});
}
