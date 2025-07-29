import Foundation
import UserNotifications

class NotificationManager {
    static let instance = NotificationManager() // Singleton
    
    func requestAuthorization() {
        let options: UNAuthorizationOptions = [.alert, .sound, .badge]
        UNUserNotificationCenter.current().requestAuthorization(options: options) { (success, error) in
            if let error = error {
                print("ERROR: \\(error.localizedDescription)")
            } else {
                print("SUCCESS: Notification authorization granted.")
            }
        }
    }
    
    func scheduleDailyJournalReminder() {
        let content = UNMutableNotificationContent()
        content.title = "Yof의 편지 💌"
        content.subtitle = "오늘 하루는 어땠나요? 당신의 이야기를 들려주세요."
        content.sound = .default
        content.badge = 1
        
        // 매일 저녁 9시에 알림 설정
        var dateComponents = DateComponents()
        dateComponents.hour = 21
        dateComponents.minute = 0
        let trigger = UNCalendarNotificationTrigger(dateMatching: dateComponents, repeats: true)
        
        let request = UNNotificationRequest(
            id: "dailyJournalReminder",
            content: content,
            trigger: trigger
        )
        
        UNUserNotificationCenter.current().add(request) { error in
            if let error = error {
                print("ERROR scheduling notification: \\(error.localizedDescription)")
            } else {
                print("SUCCESS: Daily journal reminder scheduled.")
            }
        }
    }
    
    func cancelNotifications() {
        UNUserNotificationCenter.current().removeAllPendingNotificationRequests()
        UNUserNotificationCenter.current().removeAllDeliveredNotifications()
        print("All notifications cancelled.")
    }
} 