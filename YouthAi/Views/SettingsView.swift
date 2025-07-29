import SwiftUI
import SwiftData

struct SettingsView: View {
    @Environment(\.modelContext) private var modelContext
    @Query private var users: [User]
    
    @State private var name: String = ""
    @State private var birthDate: Date = .now
    @State private var notificationsEnabled: Bool = false
    
    private var user: User? {
        users.first
    }

    var body: some View {
        NavigationView {
            ZStack {
                Color.theme.background.ignoresSafeArea()
                Form {
                    Section(header: Text("사용자 정보")) {
                        TextField("이름", text: $name)
                        DatePicker("생년월일", selection: $birthDate, displayedComponents: .date)
                    }
                    .listRowBackground(Color.theme.componentBackground)
                    
                    Section(header: Text("알림")) {
                        Toggle("매일 저녁 일기 알림", isOn: $notificationsEnabled)
                            .onChange(of: notificationsEnabled) { newValue in
                                handleNotificationSetting(enabled: newValue)
                            }
                    }
                    .listRowBackground(Color.theme.componentBackground)
                    
                    Section {
                        Button(action: saveUser) {
                            Text("정보 저장")
                        }
                        .listRowBackground(Color.theme.componentBackground)
                    }
                }
                .scrollContentBackground(.hidden)
            }
            .navigationTitle("설정")
            .onAppear(perform: loadUser)
        }
    }
    
    private func loadUser() {
        if let user = user {
            name = user.name
            birthDate = user.birthDate
        }
    }
    
    private func saveUser() {
        if let user = user {
            user.name = name
            user.birthDate = birthDate
        } else {
            let newUser = User(name: name, birthDate: birthDate)
            modelContext.insert(newUser)
        }
        // 간단한 저장 완료 알림 (실제 앱에서는 더 나은 UI/UX 필요)
        print("사용자 정보가 저장되었습니다.")
    }
    
    private func handleNotificationSetting(enabled: Bool) {
        if enabled {
            NotificationManager.instance.requestAuthorization()
            NotificationManager.instance.scheduleDailyJournalReminder()
        } else {
            NotificationManager.instance.cancelNotifications()
        }
    }
}

struct SettingsView_Previews: PreviewProvider {
    static var previews: some View {
        SettingsView()
            .modelContainer(for: User.self, inMemory: true)
    }
} 