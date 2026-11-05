with open('C:/Projects/Memora/frontend/components/ui/MemoraTabBar.tsx', 'r') as f:
    content = f.read()

start_marker = '<<<<<<< HEAD'
end_marker = '>>>>>>> 21dd7a6199b0cbd7edfc4b7a45adb2a18b8857c0'

start_idx = content.find(start_marker)
end_idx = content.find(end_marker)

if start_idx >= 0 and end_idx >= 0:
    # Get the section to replace (from HEAD marker to end marker inclusive)
    section = content[start_idx:end_idx + len(end_marker)]
    
    # The replacement content - what should be after the activeLabel closing brace
    replacement = """    },
    // Larger create button styles
    createButton: {
      marginHorizontal: 4,
      transitionDuration: '200ms',
    } as any,
    createButtonPressed: {
      opacity: 0.85,
      transform: [{ scale: 0.92 }],
    },
    createIconCircle: {
      width: 56,
      height: 56,
      borderRadius: 28,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.accent,
      borderWidth: 2,
      borderColor: isDark ? colors.accentLight : colors.accentDeep,
      ...(Platform.OS === 'web'
        ? ({
            boxShadow: isDark
              ? '0 4px 20px rgba(128, 82, 200, 0.5), 0 2px 8px rgba(128, 82, 200, 0.3)'
              : '0 4px 20px rgba(128, 101, 143, 0.4), 0 2px 8px rgba(128, 101, 143, 0.25)',
          } as any)
        : {
            shadowColor: colors.accent,
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.4,
            shadowRadius: 10,
            elevation: 8,
          }),
    }"""
    
    new_content = content.replace(section, replacement)
    
    with open('C:/Projects/Memora/frontend/components/ui/MemoraTabBar.tsx', 'w') as f:
        f.write(new_content)
    
    print("File fixed successfully!")
else:
    print(f"Start marker at: {start_idx}, End marker at: {end_idx}")