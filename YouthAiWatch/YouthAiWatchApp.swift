import SwiftUI
import SwiftData

@main
struct YouthAiWatchApp: App {
    
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
            cloudKitContainerIdentifier: "iCloud.com.example.YouthAi",
            groupContainer: .identifier("group.com.example.YouthAi")
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
    }
} 