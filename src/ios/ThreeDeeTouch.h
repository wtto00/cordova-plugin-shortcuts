#import <Cordova/CDVPlugin.h>

@interface ThreeDeeTouch : CDVPlugin

@property BOOL initDone;

- (void) deviceIsReady:(CDVInvokedUrlCommand*)command;

- (void) isAvailable:(CDVInvokedUrlCommand*)command;

- (void) watchForceTouches:(CDVInvokedUrlCommand*)command;

- (void) createDynamicShortcut:(CDVInvokedUrlCommand*)command;
- (void) removeAllDynamicShortcuts:(CDVInvokedUrlCommand*)command;
- (void) getDynamicShortcuts:(CDVInvokedUrlCommand*)command;
- (void) setDynamicShortcuts:(CDVInvokedUrlCommand*)command;

- (void) enableLinkPreview:(CDVInvokedUrlCommand*)command;
- (void) disableLinkPreview:(CDVInvokedUrlCommand*)command;

@end

@class ForceTouchRecognizer;
@interface ForceTouchRecognizer : UIGestureRecognizer {
    ForceTouchRecognizer * ForceTouchRecognizer;
}
@property NSString* callbackId;
@property id<CDVCommandDelegate> commandDelegate;
- (void)touchesMoved:(NSSet *)touches withEvent:(UIEvent *)event;
@end
