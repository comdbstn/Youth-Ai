import SwiftUI

extension Color {
    static let theme = ColorTheme()
}

struct ColorTheme {
    // #3498db - 선명한 파란색
    let accent = Color(red: 52/255, green: 152/255, blue: 219/255)
    // #121212 - 깊은 검은색
    let background = Color(red: 18/255, green: 18/255, blue: 18/255)
    let secondaryText = Color.secondary
    // #1E1E1E - 살짝 밝은 검은색
    let componentBackground = Color(red: 30/255, green: 30/255, blue: 30/255)
} 