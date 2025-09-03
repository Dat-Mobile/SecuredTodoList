#import <React/RCTBridgeModule.h>

@interface RCT_EXTERN_MODULE (OSVersion, NSObject)
RCT_EXTERN_METHOD(getOSVersion : (RCTPromiseResolveBlock)
                      resolve rejecter : (RCTPromiseRejectBlock)reject)
@end