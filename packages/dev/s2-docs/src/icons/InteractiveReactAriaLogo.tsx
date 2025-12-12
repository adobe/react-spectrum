'use client';

import React, {useCallback, useEffect, useId, useMemo, useRef, useState} from 'react';
import {useFocusRing, useKeyboard} from 'react-aria';

type Point = {x: number, y: number};

type Props = {
  className?: string,
  /** SVG viewBox width in user units. */
  viewBoxWidth?: number,
  /** SVG viewBox height in user units. */
  viewBoxHeight?: number,
  /** Radius of each dot in viewBox units. */
  radius?: number,
  /** X radius of top ellipse in viewBox units. */
  topRadiusX?: number,
  /** Y radius of top ellipse in viewBox units. */
  topRadiusY?: number
};

function getLocalPoint(svg: SVGSVGElement, clientX: number, clientY: number, viewBoxWidth: number, viewBoxHeight: number) {
  let rect = svg.getBoundingClientRect();
  let x = (clientX - rect.left) * (viewBoxWidth / rect.width);
  let y = (clientY - rect.top) * (viewBoxHeight / rect.height);
  return {x, y};
}

/**
 * Apply increasing resistance as distance grows.
 * Uses logarithmic scaling: small drags feel 1:1, but the farther you drag,
 * the harder it becomes.
 */
function applyResistance(dx: number, dy: number, scale: number) {
  let d = Math.hypot(dx, dy);
  if (d === 0) {
    return {dx, dy};
  }

  // Logarithmic scaling: r = scale * ln(1 + d/scale)
  // At small distances, this is approximately linear (1:1 feel)
  // At large distances, growth slows logarithmically
  let r = scale * Math.log1p(d / scale);
  let ratio = r / d;
  return {dx: dx * ratio, dy: dy * ratio};
}

// Rest positions for the three dots.
const REST_TOP: Point = {x: 107.25, y: 42.9};
const REST_BOTTOM_LEFT: Point = {x: 42.5853, y: 154.761};
const REST_BOTTOM_RIGHT: Point = {x: 169.302, y: 154.761};

// Center of the three dots (for rotation)
const CENTER: Point = {
  x: (REST_TOP.x + REST_BOTTOM_LEFT.x + REST_BOTTOM_RIGHT.x) / 3,
  y: (REST_TOP.y + REST_BOTTOM_LEFT.y + REST_BOTTOM_RIGHT.y) / 3
};

// Rotate a point around a center by angle (radians)
function rotatePoint(p: Point, center: Point, angle: number): Point {
  let cos = Math.cos(angle);
  let sin = Math.sin(angle);
  let dx = p.x - center.x;
  let dy = p.y - center.y;
  return {
    x: center.x + dx * cos - dy * sin,
    y: center.y + dx * sin + dy * cos
  };
}

// Original static path control points.
const PATH_POINTS = {
  start: {x: 5.34961, y: 133.925},
  topLeft: {x: 70.1998, y: 22.0977},
  mid: {x: 106.449, y: 85.7695},
  c1_cp1: {x: 104.449, y: 85.7695},
  c1_cp2: {x: 103.949, y: 85.7695},
  c1_end: {x: 100.749, y: 86.4477},
  c2_cp1: {x: 59.1485, y: 102.698},
  c2_cp2: {x: 94.1415, y: 171.607},
  c2_end: {x: 138.141, y: 125.592},
  bottom: {x: 138.141, y: 183.845},
  c3_cp1: {x: 121.522, y: 166.188},
  c3_cp2: {x: 87.246, y: 169.304},
  c3_end: {x: 75.8207, y: 181.768}
};

// Threshold for considering the system "at rest"
const VELOCITY_THRESHOLD = 0.01;
const POSITION_THRESHOLD = 0.1;

function transformPoint(
  p: Point,
  top: Point,
  bottomLeft: Point,
  bottomRight: Point
): Point {
  // Compute how each dot has moved from rest.
  let topDx = top.x - REST_TOP.x;
  let topDy = top.y - REST_TOP.y;
  let blDx = bottomLeft.x - REST_BOTTOM_LEFT.x;
  let blDy = bottomLeft.y - REST_BOTTOM_LEFT.y;
  let brDx = bottomRight.x - REST_BOTTOM_RIGHT.x;
  let brDy = bottomRight.y - REST_BOTTOM_RIGHT.y;

  // Weight based on proximity to each rest position.
  let dTop = Math.hypot(p.x - REST_TOP.x, p.y - REST_TOP.y) + 1;
  let dBL = Math.hypot(p.x - REST_BOTTOM_LEFT.x, p.y - REST_BOTTOM_LEFT.y) + 1;
  let dBR = Math.hypot(p.x - REST_BOTTOM_RIGHT.x, p.y - REST_BOTTOM_RIGHT.y) + 1;

  let wTop = 1 / dTop;
  let wBL = 1 / dBL;
  let wBR = 1 / dBR;
  let wSum = wTop + wBL + wBR;

  let dx = (wTop * topDx + wBL * blDx + wBR * brDx) / wSum;
  let dy = (wTop * topDy + wBL * blDy + wBR * brDy) / wSum;

  return {x: p.x + dx, y: p.y + dy};
}

function getConnectorPath(top: Point, bottomLeft: Point, bottomRight: Point, connectorRotation: number = 0): string {
  let t = (p: Point) => transformPoint(p, top, bottomLeft, bottomRight);

  // First transform points based on circle positions, then rotate around center
  let rotateResult = (p: Point) => rotatePoint(t(p), CENTER, connectorRotation);

  let start = rotateResult(PATH_POINTS.start);
  let topLeft = rotateResult(PATH_POINTS.topLeft);
  let mid = rotateResult(PATH_POINTS.mid);
  let c1_cp1 = rotateResult(PATH_POINTS.c1_cp1);
  let c1_cp2 = rotateResult(PATH_POINTS.c1_cp2);
  let c1_end = rotateResult(PATH_POINTS.c1_end);
  let c2_cp1 = rotateResult(PATH_POINTS.c2_cp1);
  let c2_cp2 = rotateResult(PATH_POINTS.c2_cp2);
  let c2_end = rotateResult(PATH_POINTS.c2_end);
  let bottom = rotateResult(PATH_POINTS.bottom);
  let c3_cp1 = rotateResult(PATH_POINTS.c3_cp1);
  let c3_cp2 = rotateResult(PATH_POINTS.c3_cp2);
  let c3_end = rotateResult(PATH_POINTS.c3_end);

  return `M ${start.x} ${start.y} ` +
    `L ${topLeft.x} ${topLeft.y} ` +
    `L ${mid.x} ${mid.y} ` +
    `C ${c1_cp1.x} ${c1_cp1.y} ${c1_cp2.x} ${c1_cp2.y} ${c1_end.x} ${c1_end.y} ` +
    `C ${c2_cp1.x} ${c2_cp1.y} ${c2_cp2.x} ${c2_cp2.y} ${c2_end.x} ${c2_end.y} ` +
    `L ${bottom.x} ${bottom.y} ` +
    `C ${c3_cp1.x} ${c3_cp1.y} ${c3_cp2.x} ${c3_cp2.y} ${c3_end.x} ${c3_end.y} ` +
    `L ${start.x} ${start.y} Z`;
}

export function InteractiveReactAriaLogo(props: Props) {
  let {
    className,
    viewBoxWidth = 212,
    viewBoxHeight = 198,
    radius = 42.5853,
    topRadiusX = 42.25,
    topRadiusY = 42.9
  } = props;

  let color = '#FF0000';

  // The top to bottom-right edge stays unconnected at rest.
  let rest = useMemo<Point[]>(
    () => [
      REST_TOP, // top (ellipse)
      REST_BOTTOM_LEFT, // bottom-left
      REST_BOTTOM_RIGHT // bottom-right
    ],
    []
  );

  let [points, setPoints] = useState<Point[]>(rest);
  let [connectorRotation, setConnectorRotation] = useState(0);

  let svgRef = useRef<SVGSVGElement | null>(null);
  let rafRef = useRef<number>(0);
  let isAnimatingRef = useRef(false);

  // Track which keys are currently pressed for continuous movement
  let pressedKeysRef = useRef<Set<string>>(new Set());

  let stateRef = useRef({
    pos: rest.map(p => ({...p})),
    vel: rest.map(() => ({x: 0, y: 0})),
    draggingIndex: -1,
    pointerId: -1,
    dragStartPointer: {x: 0, y: 0},
    dragStartPos: {x: 0, y: 0},
    // Keyboard offset for each dot (top, bottom-left, bottom-right)
    keyboardOffsets: [
      {x: 0, y: 0}, // top circle
      {x: 0, y: 0}, // bottom-left circle
      {x: 0, y: 0}  // bottom-right circle
    ],
    // Rotation state (in radians)
    rotation: 0,
    rotationVelocity: 0,
    targetRotation: 0, // snaps to multiples of 2π/3 (120 degrees)
    hasDragged: false // track if pointer moved significantly during press
  });

  // Focus ring for keyboard interaction
  let {isFocusVisible, focusProps} = useFocusRing();

  // Keep internal spring state in sync if rest changes (it shouldn't).
  useEffect(() => {
    stateRef.current.pos = rest.map(p => ({...p}));
    stateRef.current.vel = rest.map(() => ({x: 0, y: 0}));
  }, [rest]);

  // Check if system is at rest
  let isAtRest = useCallback((s: typeof stateRef.current) => {
    if (s.draggingIndex >= 0) {
      return false;
    }

    // Check if connector rotation is still animating
    if (Math.abs(s.rotation - s.targetRotation) > 0.001 || Math.abs(s.rotationVelocity) > 0.001) {
      return false;
    }

    for (let i = 0; i < s.pos.length; i++) {
      let velMag = Math.hypot(s.vel[i].x, s.vel[i].y);
      let posDiff = Math.hypot(s.pos[i].x - rest[i].x, s.pos[i].y - rest[i].y);

      if (velMag > VELOCITY_THRESHOLD || posDiff > POSITION_THRESHOLD) {
        return false;
      }
    }
    return true;
  }, [rest]);

  // Start animation loop
  let startAnimation = useCallback(() => {
    if (isAnimatingRef.current) {
      return;
    }
    isAnimatingRef.current = true;

    let last = performance.now();

    let step = (now: number) => {
      let dt = Math.min((now - last) / 1000, 1 / 30);
      last = now;

      let s = stateRef.current;

      // Spring constants tuned for a snappy but soft return.
      let k = 120; // spring stiffness to rest
      let damping = 0.55; // per-frame damping at ~60fps (lower = less bounce)
      let linkK = 85; // stiffness of links between dots

      // Apply continuous keyboard force while keys are held
      // Each arrow key affects a specific dot:
      // - Up: top dot (index 0) moves up
      // - Down: bottom dots (indices 1, 2) move down
      // - Left: bottom-left dot (index 1) moves left
      // - Right: bottom-right dot (index 2) moves right
      let keyboardForce = 800; // Force applied per frame while key is held
      let keysPressed = pressedKeysRef.current;

      // Top dot (index 0): controlled by Up arrow
      if (keysPressed.has('ArrowUp')) {
        s.keyboardOffsets[0].y -= keyboardForce * dt;
      }

      // Bottom-left dot (index 1): controlled by Left and Down arrows
      if (keysPressed.has('ArrowLeft')) {
        s.keyboardOffsets[1].x -= keyboardForce * dt;
      }
      if (keysPressed.has('ArrowDown')) {
        s.keyboardOffsets[1].y += keyboardForce * dt;
      }

      // Bottom-right dot (index 2): controlled by Right and Down arrows
      if (keysPressed.has('ArrowRight')) {
        s.keyboardOffsets[2].x += keyboardForce * dt;
      }
      if (keysPressed.has('ArrowDown')) {
        s.keyboardOffsets[2].y += keyboardForce * dt;
      }

      // Apply logarithmic resistance to each keyboard offset (same feel as mouse drag)
      let maxKeyboardOffset = 60;
      let resistedOffsets = s.keyboardOffsets.map(offset =>
        applyResistance(offset.x, offset.y, maxKeyboardOffset)
      );

      // Spring each keyboard offset back to zero when its controlling keys are released
      let hasActiveKeys = keysPressed.has('ArrowUp') || keysPressed.has('ArrowDown') ||
                          keysPressed.has('ArrowLeft') || keysPressed.has('ArrowRight');

      // Spring back for each dot
      let offsetK = 8; // Spring stiffness for keyboard offset return

      // Top dot: springs back when Up is not pressed
      if (!keysPressed.has('ArrowUp')) {
        s.keyboardOffsets[0].x -= s.keyboardOffsets[0].x * offsetK * dt;
        s.keyboardOffsets[0].y -= s.keyboardOffsets[0].y * offsetK * dt;
        if (Math.abs(s.keyboardOffsets[0].x) < 0.1) {
          s.keyboardOffsets[0].x = 0;
        }
        if (Math.abs(s.keyboardOffsets[0].y) < 0.1) {
          s.keyboardOffsets[0].y = 0;
        }
      }

      // Bottom-left dot: springs back when Left and Down are not pressed
      if (!keysPressed.has('ArrowLeft')) {
        s.keyboardOffsets[1].x -= s.keyboardOffsets[1].x * offsetK * dt;
        if (Math.abs(s.keyboardOffsets[1].x) < 0.1) {
          s.keyboardOffsets[1].x = 0;
        }
      }
      if (!keysPressed.has('ArrowDown')) {
        s.keyboardOffsets[1].y -= s.keyboardOffsets[1].y * offsetK * dt;
        if (Math.abs(s.keyboardOffsets[1].y) < 0.1) {
          s.keyboardOffsets[1].y = 0;
        }
      }

      // Bottom-right dot: springs back when Right and Down are not pressed
      if (!keysPressed.has('ArrowRight')) {
        s.keyboardOffsets[2].x -= s.keyboardOffsets[2].x * offsetK * dt;
        if (Math.abs(s.keyboardOffsets[2].x) < 0.1) {
          s.keyboardOffsets[2].x = 0;
        }
      }
      if (!keysPressed.has('ArrowDown')) {
        s.keyboardOffsets[2].y -= s.keyboardOffsets[2].y * offsetK * dt;
        if (Math.abs(s.keyboardOffsets[2].y) < 0.1) {
          s.keyboardOffsets[2].y = 0;
        }
      }

      // Connector rotation physics: spring toward target rotation
      let rotationK = 12; // spring stiffness for rotation
      let rotationDamping = 0.85; // damping for rotation
      let rotationDiff = s.targetRotation - s.rotation;
      s.rotationVelocity += rotationDiff * rotationK * dt;
      s.rotationVelocity *= Math.pow(rotationDamping, dt * 60);
      s.rotation += s.rotationVelocity * dt;

      // Snap to target when close enough
      if (Math.abs(rotationDiff) < 0.001 && Math.abs(s.rotationVelocity) < 0.001) {
        s.rotation = s.targetRotation;
        s.rotationVelocity = 0;
      }

      // Apply spring to rest positions (with per-dot keyboard offset applied to target).
      // Circles stay at their original rest positions - only the connector rotates.
      for (let i = 0; i < s.pos.length; i++) {
        if (i === s.draggingIndex) {
          continue;
        }

        let px = s.pos[i].x;
        let py = s.pos[i].y;

        // Target position is rest + this dot's keyboard offset (circles don't rotate)
        let targetX = rest[i].x + resistedOffsets[i].dx;
        let targetY = rest[i].y + resistedOffsets[i].dy;

        let ax = (targetX - px) * k;
        let ay = (targetY - py) * k;

        s.vel[i].x += ax * dt;
        s.vel[i].y += ay * dt;
      }

      // Add link springs for connected edges: (top to bottom-left) and (bottom-left to bottom-right).
      let links: Array<[number, number]> = [
        [0, 1],
        [1, 2]
      ];

      for (let [a, b] of links) {
        let ax = s.pos[b].x - s.pos[a].x;
        let ay = s.pos[b].y - s.pos[a].y;
        let d = Math.hypot(ax, ay) || 1;
        let rdx = rest[b].x - rest[a].x;
        let rdy = rest[b].y - rest[a].y;
        let restD = Math.hypot(rdx, rdy) || 1;

        // Positive when stretched, negative when compressed.
        let stretch = d - restD;
        let fx = (ax / d) * (stretch * linkK);
        let fy = (ay / d) * (stretch * linkK);

        if (a !== s.draggingIndex) {
          s.vel[a].x += fx * dt;
          s.vel[a].y += fy * dt;
        }
        if (b !== s.draggingIndex) {
          s.vel[b].x -= fx * dt;
          s.vel[b].y -= fy * dt;
        }
      }

      // Integrate + damping.
      let dampPow = Math.pow(damping, dt * 60);
      for (let i = 0; i < s.pos.length; i++) {
        if (i === s.draggingIndex) {
          // Keep dragged point exactly where the pointer puts it.
          continue;
        }

        s.vel[i].x *= dampPow;
        s.vel[i].y *= dampPow;
        s.pos[i].x += s.vel[i].x * dt;
        s.pos[i].y += s.vel[i].y * dt;
      }

      // Check if at rest. If so, snap to rest and stop.
      // Also need to check all keyboard offsets are zero
      let keyboardAtRest = !hasActiveKeys && s.keyboardOffsets.every(
        offset => offset.x === 0 && offset.y === 0
      );
      if (isAtRest(s) && keyboardAtRest) {
        // Snap circles to their original rest positions
        for (let i = 0; i < s.pos.length; i++) {
          s.pos[i].x = rest[i].x;
          s.pos[i].y = rest[i].y;
          s.vel[i].x = 0;
          s.vel[i].y = 0;
        }
        setPoints(rest);
        // Update connector rotation state for React
        setConnectorRotation(s.rotation);
        isAnimatingRef.current = false;
        return; // Stop the loop
      }

      // Update React state with current positions and connector rotation
      setPoints(s.pos.map(p => ({x: p.x, y: p.y})));
      setConnectorRotation(s.rotation);
      rafRef.current = requestAnimationFrame(step);
    };

    rafRef.current = requestAnimationFrame(step);
  }, [isAtRest, rest]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, []);

  let handlePointerDown = useCallback((index: number, e: React.PointerEvent<SVGElement>) => {
    let svg = svgRef.current;
    if (!svg) {
      return;
    }

    e.preventDefault();

    let s = stateRef.current;
    s.draggingIndex = index;
    s.pointerId = e.pointerId;
    s.hasDragged = false; // Reset drag tracking

    (e.currentTarget as Element).setPointerCapture(e.pointerId);

    let p = getLocalPoint(svg, e.clientX, e.clientY, viewBoxWidth, viewBoxHeight);
    s.dragStartPointer = p;
    s.dragStartPos = {x: s.pos[index].x, y: s.pos[index].y};

    // Reset velocity for deterministic snap-back.
    s.vel[index].x = 0;
    s.vel[index].y = 0;

    startAnimation();
  }, [startAnimation, viewBoxWidth, viewBoxHeight]);

  let onPointerMove = useCallback((e: React.PointerEvent<SVGSVGElement>) => {
    let svg = svgRef.current;
    if (!svg) {
      return;
    }

    let s = stateRef.current;
    if (s.draggingIndex < 0 || e.pointerId !== s.pointerId) {
      return;
    }

    let p = getLocalPoint(svg, e.clientX, e.clientY, viewBoxWidth, viewBoxHeight);
    let dx = p.x - s.dragStartPointer.x;
    let dy = p.y - s.dragStartPointer.y;

    // Track if pointer moved significantly (more than 5 viewBox units)
    let dragDistance = Math.hypot(dx, dy);
    if (dragDistance > 5) {
      s.hasDragged = true;
    }

    // Apply logarithmic resistance - gets harder to move the farther you drag.
    let resisted = applyResistance(dx, dy, 60);

    s.pos[s.draggingIndex].x = s.dragStartPos.x + resisted.dx;
    s.pos[s.draggingIndex].y = s.dragStartPos.y + resisted.dy;
  }, [viewBoxWidth, viewBoxHeight]);

  let endDrag = useCallback((e: React.PointerEvent) => {
    let s = stateRef.current;
    if (s.draggingIndex < 0 || e.pointerId !== s.pointerId) {
      return;
    }

    // If it was a click (no significant drag), trigger clockwise rotation
    if (!s.hasDragged) {
      // Rotate by 120 degrees (2π/3 radians) clockwise
      s.targetRotation += (2 * Math.PI) / 3;
      startAnimation();
    }

    s.draggingIndex = -1;
    s.pointerId = -1;
    s.hasDragged = false;
  }, [startAnimation]);

  // Keyboard interaction for arrow keys and rotation
  let {keyboardProps} = useKeyboard({
    onKeyDown: (e) => {
      let key = e.key;
      if (key === 'ArrowUp' || key === 'ArrowDown' || key === 'ArrowLeft' || key === 'ArrowRight') {
        // Prevent default scrolling behavior
        e.preventDefault();
        // Add to pressed keys set
        pressedKeysRef.current.add(key);
        // Start animation if not already running
        startAnimation();
      } else if (key === ' ' || key === 'Enter') {
        // Trigger rotation on Space or Enter (same as click)
        e.preventDefault();
        let s = stateRef.current;
        s.targetRotation += (2 * Math.PI) / 3;
        startAnimation();
      }
    },
    onKeyUp: (e) => {
      let key = e.key;
      if (key === 'ArrowUp' || key === 'ArrowDown' || key === 'ArrowLeft' || key === 'ArrowRight') {
        // Remove from pressed keys set
        pressedKeysRef.current.delete(key);
      }
    }
  });

  let a = points[0]; // top (ellipse)
  let b = points[1]; // bottom-left
  let c = points[2]; // bottom-right

  // Memoize the connector path calculation with rotation
  let connectorPath = useMemo(
    () => getConnectorPath(a, b, c, connectorRotation),
    [a, b, c, connectorRotation]
  );

  // Stable across SSR + hydration, and unique per component instance.
  let filterId = `ra-goo-${useId()}`;

  // Unique ID for the focus ring mask
  let ringMaskId = `ra-ring-mask-${useId()}`;

  // Focus ring thickness in viewBox units
  let ringThickness = 4;

  // Gap between the shape and the focus ring
  let ringOffset = 3;

  return (
    <div
      className={className}
      style={{touchAction: 'none', overflow: 'visible', outline: 'none', willChange: 'transform'}}
      // @eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex
      tabIndex={0}
      role="img"
      aria-label="Interactive React Aria logo. Click or press Space/Enter to rotate the connector, drag to stretch, or use arrow keys."
      {...focusProps}
      {...keyboardProps}>
      <svg
        ref={svgRef}
        viewBox={`0 0 ${viewBoxWidth} ${viewBoxHeight}`}
        width="100%"
        height="100%"
        overflow="visible"
        preserveAspectRatio="xMidYMid meet"
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        onLostPointerCapture={endDrag}>
        <defs>
          {/* Gooey filter: blur + high-contrast alpha threshold to create merging effect */}
          <filter id={filterId} x="-50%" y="-50%" width="200%" height="200%" colorInterpolationFilters="sRGB">
            <feGaussianBlur in="SourceGraphic" stdDeviation="10" result="blur" />
            <feColorMatrix
              in="blur"
              mode="matrix"
              values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 25 -12"
              result="goo" />
            <feComposite in="SourceGraphic" in2="goo" operator="atop" />
          </filter>

          {/* Mask for the focus ring - shape + offset as cutout to create gap */}
          <mask id={ringMaskId} x="-100%" y="-100%" width="300%" height="300%">
            {/* White background = visible area, using large absolute coords to prevent clipping */}
            <rect x={-viewBoxWidth} y={-viewBoxHeight} width={viewBoxWidth * 3} height={viewBoxHeight * 3} fill="white" />
            {/* Shapes expanded by ringOffset as black = cutout, with gooey filter for merged edges */}
            <g filter={`url(#${filterId})`}>
              <circle cx={c.x} cy={c.y} r={radius + ringOffset} fill="black" />
              <circle cx={b.x} cy={b.y} r={radius + ringOffset} fill="black" />
              <ellipse cx={a.x} cy={a.y} rx={topRadiusX + ringOffset} ry={topRadiusY + ringOffset} fill="black" />
              <path d={connectorPath} fill="black" strokeWidth={ringOffset * 2} stroke="black" strokeLinejoin="round" />
            </g>
          </mask>
        </defs>

        {/* Focus ring - rendered behind the logo, morphs with the shape */}
        <g
          mask={`url(#${ringMaskId})`}
          style={{
            opacity: isFocusVisible ? 1 : 0,
            transition: 'opacity 300ms ease-in-out'
          }}>
          {/* Larger shapes with gooey filter, masked to create ring effect */}
          <g filter={`url(#${filterId})`}>
            <circle cx={c.x} cy={c.y} r={radius + ringOffset + ringThickness} fill="#FF6B6B" />
            <circle cx={b.x} cy={b.y} r={radius + ringOffset + ringThickness} fill="#FF6B6B" />
            <ellipse cx={a.x} cy={a.y} rx={topRadiusX + ringOffset + ringThickness} ry={topRadiusY + ringOffset + ringThickness} fill="#FF6B6B" />
            <path d={connectorPath} fill="#FF6B6B" strokeWidth={(ringOffset + ringThickness) * 2} stroke="#FF6B6B" strokeLinejoin="round" />
          </g>
        </g>

        {/* All shapes with gooey filter for fluid merging effect */}
        <g filter={`url(#${filterId})`}>
          {/* Bottom-right circle */}
          <circle cx={c.x} cy={c.y} r={radius} fill={color} />

          {/* Bottom-left circle */}
          <circle cx={b.x} cy={b.y} r={radius} fill={color} />

          {/* Top ellipse */}
          <ellipse cx={a.x} cy={a.y} rx={topRadiusX} ry={topRadiusY} fill={color} />

          {/* Connector path */}
          <path d={connectorPath} fill={color} />
        </g>

        {/* Larger invisible hit targets */}
        <g fill="transparent">
          <ellipse cx={a.x} cy={a.y} rx={topRadiusX * 1.3} ry={topRadiusY * 1.3} onPointerDown={(e) => handlePointerDown(0, e)} style={{cursor: 'grab'}} />
          <circle cx={b.x} cy={b.y} r={radius * 1.3} onPointerDown={(e) => handlePointerDown(1, e)} style={{cursor: 'grab'}} />
          <circle cx={c.x} cy={c.y} r={radius * 1.3} onPointerDown={(e) => handlePointerDown(2, e)} style={{cursor: 'grab'}} />
        </g>
      </svg>
    </div>
  );
}
