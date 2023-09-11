#import "Cordova/CDV.h"
#import "Cordova/CDVViewController.h"
#import "UIKit/UITouch.h"
#import "ThreeDeeTouch.h"

@implementation ThreeDeeTouch

- (void) deviceIsReady:(CDVInvokedUrlCommand *)command {
    self.initDone = YES;
}

- (void) isAvailable:(CDVInvokedUrlCommand *)command {
    
    bool avail = NO;
    
    if (IsAtLeastiOSVersion(@"9")) {
        avail = [self.viewController.traitCollection forceTouchCapability] == UIForceTouchCapabilityAvailable;
    }
    
    CDVPluginResult *pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK messageAsBool:avail];
    [self.commandDelegate sendPluginResult:pluginResult callbackId:command.callbackId];
}

- (void) watchForceTouches:(CDVInvokedUrlCommand*)command {
    ForceTouchRecognizer* forceTouchRecognizer = [[ForceTouchRecognizer alloc] initWithTarget:self action:nil];
    forceTouchRecognizer.callbackId = command.callbackId;
    forceTouchRecognizer.commandDelegate = self.commandDelegate;
    [self.webView addGestureRecognizer: forceTouchRecognizer];
    
    CDVPluginResult *pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_NO_RESULT];
    pluginResult.keepCallback = [NSNumber numberWithBool:YES];
    [self.commandDelegate sendPluginResult:pluginResult callbackId:command.callbackId];
}

- (void) enableLinkPreview:(CDVInvokedUrlCommand *)command {
#if !WK_WEB_VIEW_ONLY
    if ([self.webView class] == [UIWebView class]) {
        UIWebView *w = (UIWebView*)self.webView;
        w.allowsLinkPreview = YES;
    }
#endif
    [self.commandDelegate sendPluginResult:[CDVPluginResult resultWithStatus:CDVCommandStatus_OK] callbackId:command.callbackId];
}

- (void) disableLinkPreview:(CDVInvokedUrlCommand *)command {
#if !WK_WEB_VIEW_ONLY
    if ([self.webView class] == [UIWebView class]) {
        UIWebView *w = (UIWebView*)self.webView;
        w.allowsLinkPreview = NO;
    }
#endif
    [self.commandDelegate sendPluginResult:[CDVPluginResult resultWithStatus:CDVCommandStatus_OK] callbackId:command.callbackId];
}

- (void) createDynamicShortcut:(CDVInvokedUrlCommand *)command {
    NSDictionary *action = [command.arguments objectAtIndex:0];

    if ([UIApplication sharedApplication].shortcutItems.count >= 4) {
        CDVPluginResult *pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_ERROR messageAsString: @"You can not create more than 4 shortcuts"];
        [self.commandDelegate sendPluginResult:pluginResult callbackId:command.callbackId];
    } else {
        NSString *type = [action objectForKey:@"action"];
        NSString *title = [action objectForKey:@"shortLabel"];
        NSString *subtitle = [action objectForKey:@"longLabel"];
        NSString *iconType = [action objectForKey:@"iconType"];
        NSString *iconTemplate = [action objectForKey:@"icon"];
        
        UIApplicationShortcutIcon *icon = nil;
        if (iconType != nil) {
            icon = [UIApplicationShortcutIcon iconWithType:[self UIApplicationShortcutIconTypeFromString:[iconType lowercaseString]]];
        } else if (iconTemplate != nil) {
            icon = [UIApplicationShortcutIcon iconWithTemplateImageName:iconTemplate];
        }
        
        UIApplicationShortcutItem *shortcutItem = [[UIApplicationShortcutItem alloc]initWithType: type localizedTitle: title localizedSubtitle: subtitle icon: icon userInfo: nil];
        NSMutableArray *shortcutItems = [NSMutableArray arrayWithArray:[UIApplication sharedApplication].shortcutItems];
        [shortcutItems addObject:shortcutItem];
        [[UIApplication sharedApplication] setShortcutItems:shortcutItems];

        [self.commandDelegate sendPluginResult:[CDVPluginResult resultWithStatus:CDVCommandStatus_OK] callbackId:command.callbackId];
    }
}

- (void) removeAllDynamicShortcuts:(CDVInvokedUrlCommand *)command {
    NSMutableArray *items = [[NSMutableArray alloc] init];
    
    [UIApplication sharedApplication].shortcutItems = items;
    [self.commandDelegate sendPluginResult:[CDVPluginResult resultWithStatus:CDVCommandStatus_OK] callbackId:command.callbackId];
}

- (UIApplicationShortcutIconType) UIApplicationShortcutIconTypeFromString:(NSString*)str {
    // iOS 9.0 icons:
    if ([str isEqualToString:@"compose"])       return UIApplicationShortcutIconTypeCompose;
    else if ([str isEqualToString:@"play"])          return UIApplicationShortcutIconTypePlay;
    else if ([str isEqualToString:@"pause"])         return UIApplicationShortcutIconTypePause;
    else if ([str isEqualToString:@"add"])           return UIApplicationShortcutIconTypeAdd;
    else if ([str isEqualToString:@"location"])      return UIApplicationShortcutIconTypeLocation;
    else if ([str isEqualToString:@"search"])        return UIApplicationShortcutIconTypeSearch;
    else if ([str isEqualToString:@"share"])         return UIApplicationShortcutIconTypeShare;
    
    // iOS 9.1 icons:
#ifdef __IPHONE_9_1
    else if ([str isEqualToString:@"prohibit"])      return UIApplicationShortcutIconTypeProhibit;
    else if ([str isEqualToString:@"contact"])       return UIApplicationShortcutIconTypeContact;
    else if ([str isEqualToString:@"home"])          return UIApplicationShortcutIconTypeHome;
    else if ([str isEqualToString:@"marklocation"])  return UIApplicationShortcutIconTypeMarkLocation;
    else if ([str isEqualToString:@"favorite"])      return UIApplicationShortcutIconTypeFavorite;
    else if ([str isEqualToString:@"love"])          return UIApplicationShortcutIconTypeLove;
    else if ([str isEqualToString:@"cloud"])         return UIApplicationShortcutIconTypeCloud;
    else if ([str isEqualToString:@"invitation"])    return UIApplicationShortcutIconTypeInvitation;
    else if ([str isEqualToString:@"confirmation"])  return UIApplicationShortcutIconTypeConfirmation;
    else if ([str isEqualToString:@"mail"])          return UIApplicationShortcutIconTypeMail;
    else if ([str isEqualToString:@"message"])       return UIApplicationShortcutIconTypeMessage;
    else if ([str isEqualToString:@"date"])          return UIApplicationShortcutIconTypeDate;
    else if ([str isEqualToString:@"time"])          return UIApplicationShortcutIconTypeTime;
    else if ([str isEqualToString:@"capturephoto"])  return UIApplicationShortcutIconTypeCapturePhoto;
    else if ([str isEqualToString:@"capturevideo"])  return UIApplicationShortcutIconTypeCaptureVideo;
    else if ([str isEqualToString:@"task"])          return UIApplicationShortcutIconTypeTask;
    else if ([str isEqualToString:@"taskcompleted"]) return UIApplicationShortcutIconTypeTaskCompleted;
    else if ([str isEqualToString:@"alarm"])         return UIApplicationShortcutIconTypeAlarm;
    else if ([str isEqualToString:@"bookmark"])      return UIApplicationShortcutIconTypeBookmark;
    else if ([str isEqualToString:@"shuffle"])       return UIApplicationShortcutIconTypeShuffle;
    else if ([str isEqualToString:@"audio"])         return UIApplicationShortcutIconTypeAudio;
    else if ([str isEqualToString:@"update"])        return UIApplicationShortcutIconTypeUpdate;
#endif
    
    else {
        NSLog(@"Invalid iconType passed to the 3D Touch plugin. So not adding one.");
        return 0;
    }
}
@end


@implementation ForceTouchRecognizer

double lastEvent = 0;

- (void) touchesMoved:(NSSet *)touches withEvent:(UIEvent *)event {
    for (UITouch* touch in touches) {
        CGFloat percentage = (touch.force / touch.maximumPossibleForce) * 100;
        if (percentage >= 75) {
            // let's not flood the callback with multiple hits within the same second
            NSTimeInterval ts = touch.timestamp;
            int diff = ts - lastEvent;
            if (diff > 0) {
                lastEvent = ts;
                CGPoint coordinates = [touch locationInView:self.view];
                NSMutableDictionary *result = [[NSMutableDictionary alloc] initWithObjectsAndKeys:
                                               [NSString stringWithFormat:@"%d", (int)percentage]   , @"force",
                                               [NSString stringWithFormat:@"%d", (int)coordinates.x], @"x",
                                               [NSString stringWithFormat:@"%d", (int)coordinates.y], @"y",
                                               // no need to use the touch.timestamp really since it's simply 'now'
                                               [NSString stringWithFormat:@"%f", [[NSDate date] timeIntervalSince1970]], @"timestamp",
                                               nil];
                
                CDVPluginResult *pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK messageAsDictionary:result];
                pluginResult.keepCallback = [NSNumber numberWithBool:YES];
                [_commandDelegate sendPluginResult:pluginResult callbackId:_callbackId];
            }
        }
    }
}
@end
