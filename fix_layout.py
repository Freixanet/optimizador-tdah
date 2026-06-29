def fix(filepath):
    with open(filepath, 'r') as f:
        content = f.read()
    
    # Replace the duplicate definition
    old_def = """  const handleScrollViewLayout = (e: any) => {
    scrollViewHeightRef.current = e.nativeEvent.layout.height;
  };"""
    new_def = """  const onScrollViewLayout = (e: any) => {
    scrollViewHeightRef.current = e.nativeEvent.layout.height;
    if (handleScrollViewLayout) {
      handleScrollViewLayout(e);
    }
  };"""
    content = content.replace(old_def, new_def)
    
    # Replace the usage in ScrollView
    old_usage = "onLayout={handleScrollViewLayout}"
    new_usage = "onLayout={onScrollViewLayout}"
    # Make sure we only replace the one inside the component return!
    content = content.replace(old_usage, new_usage)
    
    with open(filepath, 'w') as f:
        f.write(content)

fix('mobile/src/screens/classic/ClassicResultScreen.tsx')
fix('mobile/src/screens/ResultScreen.tsx')
