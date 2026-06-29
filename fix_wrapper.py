def add_wrapper(filepath):
    with open(filepath, 'r') as f:
        content = f.read()

    # Find the start of the return block
    start_tag = "<SafeAreaView className=\"flex-1 bg-neutral-50 dark:bg-neutral-900\" edges={['top', 'left', 'right']}>"
    new_start_tag = start_tag + "\n      <View className=\"flex-1 relative overflow-hidden\">"

    # For ClassicResultScreen
    if 'ClassicResultScreen' in filepath:
        end_tag = "    </SafeAreaView>\n  );\n}"
        new_end_tag = "      </View>\n" + end_tag
    else:
        # For ResultScreen, it has ChatDrawer at the end
        end_tag = "      ) : null}\n    </SafeAreaView>\n  );\n}"
        new_end_tag = "      </View>\n" + end_tag

    content = content.replace(start_tag, new_start_tag).replace(end_tag, new_end_tag)

    with open(filepath, 'w') as f:
        f.write(content)

add_wrapper('mobile/src/screens/classic/ClassicResultScreen.tsx')
add_wrapper('mobile/src/screens/ResultScreen.tsx')
