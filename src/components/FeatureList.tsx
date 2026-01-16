import type { Platform, IconSet, ComponentPreset } from '../types';
import { PLATFORM_FEATURES, PLATFORM_PERMISSIONS, PLATFORM_COLORS } from '../types';

export interface FeatureListProps {
  platform: Platform;
  preset: ComponentPreset;
  icons?: IconSet;
}

/**
 * Feature and permissions info panel - completely headless using preset components
 * Shows platform features and permission scopes in a 2-column grid
 */
export const FeatureList = ({ platform, preset, icons }: FeatureListProps) => {
  const features = PLATFORM_FEATURES[platform];
  const permissions = PLATFORM_PERMISSIONS[platform];
  const colors = PLATFORM_COLORS[platform];

  const { Grid, Card, Flex, Text, Code } = preset;
  const CheckIcon = icons?.Check;

  return (
    <Grid cols="auto" gap="lg">
      {/* Features */}
      <Card variant="outlined" padding="md">
        <Flex direction="column" gap="sm">
          <Text variant="small" weight="semibold">
            Features
          </Text>
          <Flex direction="column" gap="xs">
            {features.map((feature, index) => (
              <Flex key={index} align="center" gap="sm">
                {CheckIcon ? (
                  <Text color="success" as="span">
                    <CheckIcon size={16} />
                  </Text>
                ) : (
                  <Text color="success" as="span">✓</Text>
                )}
                <Text variant="small" color="secondary">
                  {feature.text}
                </Text>
              </Flex>
            ))}
          </Flex>
        </Flex>
      </Card>

      {/* Permissions */}
      {permissions.length > 0 && (
        <Card variant="outlined" padding="md">
          <Flex direction="column" gap="sm">
            <Text variant="small" weight="semibold">
              Permissions
            </Text>
            <Flex direction="column" gap="xs">
              {permissions.map((permission) => (
                <Flex key={permission.id} align="center" gap="sm" wrap>
                  <Code color={colors.primary}>
                    {permission.id}
                  </Code>
                  <Text variant="small" color="secondary">
                    {permission.description.replace(/\s*\(Required\)/i, '')}
                  </Text>
                </Flex>
              ))}
            </Flex>
          </Flex>
        </Card>
      )}
    </Grid>
  );
};
