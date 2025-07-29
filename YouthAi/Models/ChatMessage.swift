import Foundation
import SwiftData

@Model
final class ChatMessage {
    let text: String
    let isFromUser: Bool
    let timestamp: Date
    
    init(text: String, isFromUser: Bool, timestamp: Date = .now) {
        self.text = text
        self.isFromUser = isFromUser
        self.timestamp = timestamp
    }
} 