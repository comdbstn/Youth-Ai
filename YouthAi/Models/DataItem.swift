import Foundation
import SwiftData

@Model
final class Goal {
    var title: String
    var isCompleted: Bool
    var createdAt: Date
    
    init(title: String, isCompleted: Bool = false, createdAt: Date = .now) {
        self.title = title
        self.isCompleted = isCompleted
        self.createdAt = createdAt
    }
}

@Model
final class Routine {
    var name: String
    var count: Int
    var lastUpdated: Date
    
    init(name: String, count: Int = 0, lastUpdated: Date = .now) {
        self.name = name
        self.count = count
        self.lastUpdated = lastUpdated
    }
} 