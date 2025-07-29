import SwiftUI

@main
struct YouthAiApp: App {
    var sharedModelContainer: ModelContainer = {
        let schema = Schema([
            Goal.self,
            Routine.self,
            JournalEntry.self,
            User.self,
            ChatMessage.self,
        ])
        let modelConfiguration = ModelConfiguration(
            schema: schema,
            isStoredInMemoryOnly: false,
            cloudKitContainerIdentifier: "iCloud.com.example.YouthAi", // <- 1번: 여기서 수정
            groupContainer: .identifier("group.com.example.YouthAi") // <- 2번: 여기서 수정
        )

        do {
            return try ModelContainer(for: schema, configurations: [modelConfiguration])
        } catch {
            fatalError("Could not create ModelContainer: \\(error)")
        }
    }()

    var body: some Scene {
        WindowGroup {
            ContentView()
        }
        .modelContainer(sharedModelContainer)
        .preferredColorScheme(.dark)
        .accentColor(Color.theme.accent)
    }
} 