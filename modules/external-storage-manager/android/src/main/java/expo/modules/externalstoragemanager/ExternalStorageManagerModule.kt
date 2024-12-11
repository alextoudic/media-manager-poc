package expo.modules.externalstoragemanager

import android.app.Activity
import android.content.Context
import android.content.Intent
import android.net.Uri
import android.os.Build
import android.os.Environment
import android.os.FileUtils
import android.provider.Settings
import androidx.core.net.toFile
import expo.modules.kotlin.Promise
import expo.modules.kotlin.exception.CodedException
import expo.modules.kotlin.exception.Exceptions
import expo.modules.kotlin.exception.UnexpectedException
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition
import java.util.regex.Pattern

internal class MissingCurrentActivityException :
  CodedException("Activity which was provided during module initialization is no longer available")

private fun slashifyFilePath(path: String?): String? {
  return if (path == null) {
    null
  } else if (path.startsWith("file:///")) {
    path
  } else {
    // Ensure leading schema with a triple slash
    Pattern.compile("^file:/*").matcher(path).replaceAll("file:///")
  }
}

class ExternalStorageManagerModule : Module() {
  companion object {
    const val REQUEST_CODE_MANAGE_EXTERNAL_STORAGE = 1894
  }

  private var requestPermissionPromise: Promise? = null

  private val context: Context
    get() = appContext.reactContext ?: throw Exceptions.ReactContextLost()

  private val currentActivity
    get() = appContext.activityProvider?.currentActivity
      ?: throw MissingCurrentActivityException()

  override fun definition() = ModuleDefinition {
    Name("ExternalStorageManager")

    AsyncFunction("getIsExternalStorageManagerAsync") { promise: Promise ->
      if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.R) {
        promise.resolve(Environment.isExternalStorageManager())
      }

      promise.reject(UnexpectedException("Provided path target an unhandled type of file"))
    }

    AsyncFunction("requestPermissionAsync") { promise: Promise ->
      if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.R) {
        requestPermissionPromise = promise
        val intent = Intent(Settings.ACTION_MANAGE_APP_ALL_FILES_ACCESS_PERMISSION)
        intent.data = Uri.parse("package:${context.packageName}")
        currentActivity.startActivityForResult(intent, REQUEST_CODE_MANAGE_EXTERNAL_STORAGE, null)
      } else {
        promise.resolve(true)
      }
    }

    AsyncFunction("deleteExternalFileAsync") { uriStr: String, promise: Promise ->
      val uri = Uri.parse(slashifyFilePath(uriStr))

      if (uri.scheme == "file") {
        val file = uri.toFile()
        if (file.exists()) {
          promise.resolve(file.delete())
        }
      }
    }

    OnActivityResult { _, payload ->
      if (payload.requestCode == REQUEST_CODE_MANAGE_EXTERNAL_STORAGE) {
        when (payload.resultCode) {
          Activity.RESULT_OK -> {
            requestPermissionPromise?.resolve(true)
          }
          Activity.RESULT_CANCELED -> {
            requestPermissionPromise?.resolve(false)
          }

          else -> {
            requestPermissionPromise?.reject(
              UnexpectedException("An unknown error occurred allowing external storage management")
            )
          }
        }

        requestPermissionPromise = null
      }
    }
  }
}
