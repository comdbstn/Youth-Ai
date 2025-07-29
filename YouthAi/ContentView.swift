import SwiftUI

struct ContentView: View {
    var body: some View {
        TabView {
            HomeView()
                .tabItem {
                    Label("홈", systemImage: "house.fill")
                }

            ChatbotView()
                .tabItem {
                    Label("Yof", systemImage: "message.fill")
                }

            JournalView()
                .tabItem {
                    Label("일지", systemImage: "book.fill")
                }

            RoutineView()
                .tabItem {
                    Label("루틴", systemImage: "list.bullet.clipboard.fill")
                }

            DigitalDetoxView()
                .tabItem {
                    Label("디톡스", systemImage: "leaf.fill")
                }
            
            SettingsView()
                .tabItem {
                    Label("설정", systemImage: "gearshape.fill")
                }
        }
    }
}

struct ContentView_Previews: PreviewProvider {
    static var previews: some View {
        ContentView()
    }
} 