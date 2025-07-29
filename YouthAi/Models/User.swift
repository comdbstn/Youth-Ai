import Foundation
import SwiftData

@Model
final class User {
    var name: String
    var birthDate: Date
    
    init(name: String, birthDate: Date) {
        self.name = name
        self.birthDate = birthDate
    }
} 