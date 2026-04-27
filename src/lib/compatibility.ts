
export interface CompatibilityRule {
  loader: string;
  minMcVersion: string;
  recommendedVersions: string[];
  notes: string;
}

export const MOD_LOADER_RULES: Record<string, CompatibilityRule> = {
  forge: {
    loader: 'Forge',
    minMcVersion: '1.1',
    recommendedVersions: ['1.8.9', '1.12.2', '1.16.5', '1.18.2', '1.19.4', '1.20.1'],
    notes: 'Long-standing standard. Highly stable Choice for 1.12.2 and older.'
  },
  fabric: {
    loader: 'Fabric',
    minMcVersion: '1.14',
    recommendedVersions: ['1.14.4', '1.16.5', '1.18.2', '1.19.2', '1.20.1', '1.21'],
    notes: 'Fastest updates. Lightweight and optimized for modern versions.'
  },
  neoforge: {
    loader: 'NeoForge',
    minMcVersion: '1.20.1',
    recommendedVersions: ['1.20.1', '1.20.4', '1.21'],
    notes: 'Successor to Forge. Use this for 1.20.2+ for the best experience.'
  },
  quilt: {
    loader: 'Quilt',
    minMcVersion: '1.18.2',
    recommendedVersions: ['1.18.2', '1.19.4', '1.20.1', '1.21'],
    notes: 'Modular loader with Fabric compatibility. Great community focus.'
  }
};

export function checkCompatibility(loader: string, version: string) {
  const rule = MOD_LOADER_RULES[loader.toLowerCase()];
  if (!rule) return null;

  const isRecommended = rule.recommendedVersions.includes(version);
  
  // Basic semver comparison (naive for brevity)
  const vNum = parseFloat(version);
  const minNum = parseFloat(rule.minMcVersion);
  
  if (vNum < minNum) {
    return {
      type: 'error',
      message: `${rule.loader} is not supported on Minecraft ${version}. Minimum version is ${rule.minMcVersion}.`
    };
  }

  if (!isRecommended) {
    return {
      type: 'warning',
      message: `${version} is not a primary target for ${rule.loader}. Expect potential API instability.`
    };
  }

  return {
    type: 'success',
    message: `Full compatibility confirmed for ${rule.loader} on ${version}.`
  };
}
