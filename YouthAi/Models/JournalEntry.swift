import Foundation
import SwiftData

@Model
final class JournalEntry {
    var emotion: String
    var entryText: String
    var date: Date
    
    init(emotion: String, entryText: String, date: Date = .now) {
        self.emotion = emotion
        self.entryText = entryText
        self.date = date
    }
} 