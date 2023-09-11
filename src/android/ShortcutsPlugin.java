package wang.tato.shortcuts;

import android.annotation.TargetApi;
import android.content.Context;
import android.content.Intent;
import android.content.pm.ShortcutInfo;
import android.content.pm.ShortcutManager;
import android.graphics.Bitmap;
import android.graphics.BitmapFactory;
import android.graphics.drawable.Icon;
import android.os.Build;
import android.util.Base64;

import androidx.annotation.RequiresApi;

import org.apache.cordova.CallbackContext;
import org.apache.cordova.CordovaPlugin;
import org.apache.cordova.PluginResult;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.Iterator;
import java.util.List;

import %CORDOVA_MAIN_PACKAGE%.ShortcutHelperActivity;

public class ShortcutsPlugin extends CordovaPlugin {

    private static final String TAG = "ShortcutsPlugin";
    private static final String NOT_SUPPORT = "Current system version does not support.";
    private Context context = null;

    public ShortcutsPlugin() {
    }

    @TargetApi(25)
    public boolean execute(String action, JSONArray args, final CallbackContext callbackContext) {
        if (android.os.Build.VERSION.SDK_INT < android.os.Build.VERSION_CODES.N_MR1) {
            callbackContext.sendPluginResult(new PluginResult(PluginResult.Status.ERROR, NOT_SUPPORT));
            return false;
        }
        context = this.cordova.getActivity().getApplicationContext();
        if ("getSelectedShortcut".equals(action)) {
            this.getSelectedShortcut(callbackContext);
        } else if ("getDynamicShortcuts".equals(action)) {
            this.getDynamicShortcuts(callbackContext);
        } else if ("setDynamicShortcuts".equals(action)) {
            this.setDynamicShortcuts(args, callbackContext);
        } else if ("createDynamicShortcut".equals(action)) {
            this.createDynamicShortcut(args, callbackContext);
        } else if ("removeAllDynamicShortcuts".equals(action)) {
            this.removeAllDynamicShortcuts(callbackContext);
        } else {
            callbackContext.sendPluginResult(new PluginResult(PluginResult.Status.INVALID_ACTION));
        }
        return true;
    }

    private void getSelectedShortcut(final CallbackContext callbackContext) {
        JSONObject response = new JSONObject();
        try {
            response.put("action", ShortcutHelperActivity.ACTION);
            callbackContext.success(response);
            ShortcutHelperActivity.ACTION = null;
        } catch (JSONException e) {
            e.printStackTrace();
            callbackContext.sendPluginResult(new PluginResult(PluginResult.Status.JSON_EXCEPTION));
        }
    }

    @RequiresApi(api = Build.VERSION_CODES.N_MR1)
    private void getDynamicShortcuts(final CallbackContext callbackContext) {
        try {
            ShortcutManager shortcutManager = context.getSystemService(ShortcutManager.class);
            List<ShortcutInfo> dynamicShortcuts = shortcutManager.getDynamicShortcuts();
            JSONArray jsonArray = new JSONArray();
            for (ShortcutInfo shortcutInfo : dynamicShortcuts) {
                JSONObject jsonObject = new JSONObject();
                jsonObject.put("id", shortcutInfo.getId());
                jsonObject.put("shortLabel", shortcutInfo.getShortLabel());
                jsonObject.put("longLabel", shortcutInfo.getLongLabel());
                jsonObject.put("disabledMessage", shortcutInfo.getDisabledMessage());
                jsonObject.put("action", shortcutInfo.getIntent().getAction());

                jsonArray.put(jsonObject);
            }
            callbackContext.sendPluginResult(new PluginResult(PluginResult.Status.OK, jsonArray));
        } catch (Exception e) {
            e.printStackTrace();
            callbackContext.sendPluginResult(new PluginResult(PluginResult.Status.ERROR));
        }
    }

    @RequiresApi(api = Build.VERSION_CODES.N_MR1)
    private void setDynamicShortcuts(JSONArray args, final CallbackContext callbackContext) {
        ShortcutManager shortcutManager = context.getSystemService(ShortcutManager.class);
        Intent intent = new Intent(context, ShortcutHelperActivity.class);
        try {
            JSONArray jsonArray = new JSONArray(args.getString(0));
            int len = jsonArray.length();
            if (len > 4) {
                callbackContext.error("You can not create more than 4 shortcuts");
                return;
            }
            List<ShortcutInfo> shortcuts = new ArrayList<>();
            for (int i = 0; i < len; i++) {
                JSONObject jsonObject = (JSONObject) jsonArray.get(i);

                intent.setAction(jsonObject.getString("action"));
                String icon = jsonObject.getString("icon");
                ShortcutInfo shortcutInfo = null;
                Icon shortcutIcon = null;

                if (jsonObject.has("iconIsBase64") && jsonObject.getBoolean("iconIsBase64")) {
                    byte[] decodedString = Base64.decode(icon, Base64.DEFAULT);
                    Bitmap decodedByte = BitmapFactory.decodeByteArray(decodedString, 0, decodedString.length);
                    shortcutIcon = Icon.createWithBitmap(decodedByte);
                } else {
                    shortcutIcon = Icon.createWithResource(context, context.getResources().getIdentifier(icon, "drawable", context.getPackageName()));
                }

                if (!jsonObject.optString("shortLabel").isEmpty() || jsonObject.optString("longLabel").isEmpty()) {
                    if (!jsonObject.optString("shortLabel").isEmpty() && !jsonObject.optString("longLabel").isEmpty()) {
                        shortcutInfo = new ShortcutInfo.Builder(context, jsonObject.getString("id")).setShortLabel(jsonObject.optString("shortLabel")).setLongLabel(jsonObject.optString("longLabel")).setIcon(shortcutIcon).setIntent(intent).build();
                    } else if (!jsonObject.optString("shortLabel").isEmpty()) {
                        shortcutInfo = new ShortcutInfo.Builder(context, jsonObject.getString("id")).setShortLabel(jsonObject.optString("shortLabel")).setIcon(shortcutIcon).setIntent(intent).build();
                    } else if (!jsonObject.optString("longLabel").isEmpty()) {
                        shortcutInfo = new ShortcutInfo.Builder(context, jsonObject.getString("id")).setLongLabel(jsonObject.optString("longLabel")).setIcon(shortcutIcon).setIntent(intent).build();
                    }
                }
                if (!shortcutInfo.equals(null)) {
                    shortcuts.add(shortcutInfo);
                }
            }
            shortcutManager.setDynamicShortcuts(shortcuts);
            callbackContext.success();
        } catch (JSONException e) {
            e.printStackTrace();
            callbackContext.sendPluginResult(new PluginResult(PluginResult.Status.ERROR));
        }
    }

    @RequiresApi(api = Build.VERSION_CODES.N_MR1)
    private void createDynamicShortcut(JSONArray args, final CallbackContext callbackContext) {
        ShortcutManager shortcutManager = context.getSystemService(ShortcutManager.class);
        if ((shortcutManager.getDynamicShortcuts().size() + shortcutManager.getManifestShortcuts().size()) >= 4) {
            callbackContext.error("You can not create more than 4 shortcuts");
            return;
        }
        Intent intent = new Intent(context, ShortcutHelperActivity.class);
        try {
            JSONObject jsonObject = new JSONObject(args.getString(0));
            intent.setAction(jsonObject.getString("action"));
            String icon = jsonObject.getString("icon");
            ShortcutInfo shortcutInfo = null;
            Icon shortcutIcon = null;

            if (jsonObject.has("iconIsBase64") && jsonObject.getBoolean("iconIsBase64")) {
                byte[] decodedString = Base64.decode(icon, Base64.DEFAULT);
                Bitmap decodedByte = BitmapFactory.decodeByteArray(decodedString, 0, decodedString.length);
                shortcutIcon = Icon.createWithBitmap(decodedByte);
            } else {
                shortcutIcon = Icon.createWithResource(context, context.getResources().getIdentifier(icon, "drawable", context.getPackageName()));
            }

            if (jsonObject.optString("shortLabel").isEmpty() && jsonObject.optString("longLabel").isEmpty()) {
                callbackContext.sendPluginResult(new PluginResult(PluginResult.Status.ERROR, "Missing parameters shortLabel and longLabel."));
            } else {
                if (!jsonObject.optString("shortLabel").isEmpty() && !jsonObject.optString("longLabel").isEmpty()) {
                    shortcutInfo = new ShortcutInfo.Builder(context, jsonObject.getString("id")).setShortLabel(jsonObject.optString("shortLabel")).setLongLabel(jsonObject.optString("longLabel")).setIcon(shortcutIcon).setIntent(intent).build();
                } else if (!jsonObject.optString("shortLabel").isEmpty()) {
                    shortcutInfo = new ShortcutInfo.Builder(context, jsonObject.getString("id")).setShortLabel(jsonObject.optString("shortLabel")).setIcon(shortcutIcon).setIntent(intent).build();
                } else if (!jsonObject.optString("longLabel").isEmpty()) {
                    shortcutInfo = new ShortcutInfo.Builder(context, jsonObject.getString("id")).setLongLabel(jsonObject.optString("longLabel")).setIcon(shortcutIcon).setIntent(intent).build();
                }
                shortcutManager.addDynamicShortcuts(Arrays.asList(shortcutInfo));
                callbackContext.success();
            }
        } catch (JSONException e) {
            e.printStackTrace();
            callbackContext.sendPluginResult(new PluginResult(PluginResult.Status.ERROR));
        }
    }

    @RequiresApi(api = Build.VERSION_CODES.N_MR1)
    private void removeAllDynamicShortcuts(final CallbackContext callbackContext) {
        ShortcutManager shortcutManager = context.getSystemService(ShortcutManager.class);
        shortcutManager.removeAllDynamicShortcuts();
        callbackContext.success();
    }
}