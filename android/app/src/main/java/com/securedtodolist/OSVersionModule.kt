package com.securedtodolist

import android.os.Build
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.Promise

class OSVersionModule(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {
    override fun getName(): String {
        return "OSVersion"
    }

    @ReactMethod
    fun getOSVersion(promise: Promise) {
        try {
            val version = "Android ${Build.VERSION.RELEASE}"
            promise.resolve(version)
        } catch (e: Exception) {
            promise.reject("ERR", e)
        }
    }
}