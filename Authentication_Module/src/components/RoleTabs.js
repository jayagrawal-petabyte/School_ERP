// ─── RoleTabs Component ─────────────────────────────────────────────────────

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { ROLES, COLORS } from '../constants';

const RoleTabs = ({ selectedRole, onSelect }) => {
  return (
    <View style={styles.container}>
      {ROLES.map((role) => {
        const isActive = selectedRole.key === role.key;
        return (
          <TouchableOpacity
            key={role.key}
            style={[styles.tab, isActive && styles.tabActive]}
            onPress={() => onSelect(role)}
            activeOpacity={0.7}
          >
            <Text style={styles.icon}>{role.icon}</Text>
            <Text
              style={[
                styles.label,
                isActive && { color: role.accent, fontWeight: '600' },
              ]}
            >
              {role.label}
            </Text>
            {role.requiresMFA && isActive && (
              <Text style={styles.mfaBadge}>MFA</Text>
            )}
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: COLORS.tabBg,
    borderRadius: 12,
    padding: 4,
    marginBottom: 28,
    gap: 2,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 9,
    borderRadius: 9,
    gap: 2,
  },
  tabActive: {
    backgroundColor: COLORS.surface,
    shadowColor: '#000',
    shadowOpacity: 0.07,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  icon: { fontSize: 17 },
  label: {
    fontSize: 10,
    fontWeight: '500',
    color: COLORS.textMuted,
  },
  mfaBadge: {
    fontSize: 8,
    fontWeight: '700',
    color: '#EF4444',
    backgroundColor: '#FEF2F2',
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 4,
    marginTop: 1,
  },
});

export default RoleTabs;
