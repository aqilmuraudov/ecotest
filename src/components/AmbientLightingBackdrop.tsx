import React from 'react';

/**
 * A shared architectural-lighting atmosphere for every public route.
 * The geometry is intentionally CSS driven so it remains crisp, lightweight
 * and consistent behind pages with very different content heights.
 */
export const AmbientLightingBackdrop: React.FC = () => (
  <div className="ecolife-ambient-stage" aria-hidden="true">
    <span className="ambient-haze ambient-haze--amber" />
    <span className="ambient-haze ambient-haze--cream" />

    <span className="ambient-wire ambient-wire--one" />
    <span className="ambient-wire ambient-wire--two" />
    <span className="ambient-wire ambient-wire--three" />
    <span className="ambient-wire ambient-wire--four" />
    <span className="ambient-wire ambient-wire--five" />

    <span className="ambient-fixture ambient-fixture--one"><i /></span>
    <span className="ambient-fixture ambient-fixture--two"><i /></span>
    <span className="ambient-fixture ambient-fixture--three"><i /></span>
    <span className="ambient-fixture ambient-fixture--four"><i /></span>
    <span className="ambient-fixture ambient-fixture--five"><i /></span>
  </div>
);
