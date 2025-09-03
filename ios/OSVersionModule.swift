import Foundation
import UIKit
import React

@objc(OSVersion)
class OSVersion: NSObject {
  @objc
  func getOSVersion(_ resolve: RCTPromiseResolveBlock, rejecter reject: RCTPromiseRejectBlock) {
    let version = "iOS " + UIDevice.current.systemVersion
    resolve(version)
  }
}
