def fix(filepath):
    with open(filepath, 'r') as f:
        content = f.read()
    
    # ClassicResultScreen
    content = content.replace("      </View>\n    </SafeAreaView>\n  );\n}", "    </View>\n    </SafeAreaView>\n  );\n}")
    
    # ResultScreen
    old_end = """      ) : null}
    </SafeAreaView>"""
    bad_end = """      </View>
      ) : null}
    </SafeAreaView>"""
    good_end = """      ) : null}
      </View>
    </SafeAreaView>"""
    content = content.replace(bad_end, good_end)
    
    with open(filepath, 'w') as f:
        f.write(content)

fix('mobile/src/screens/classic/ClassicResultScreen.tsx')
fix('mobile/src/screens/ResultScreen.tsx')
