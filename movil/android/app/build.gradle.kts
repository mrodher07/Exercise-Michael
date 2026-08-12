plugins {
    id("com.android.application")
    // The Flutter Gradle Plugin must be applied after the Android and Kotlin Gradle plugins.
    id("dev.flutter.flutter-gradle-plugin")
}

android {
    namespace = "es.fitlog.fitlog"
    compileSdk = flutter.compileSdkVersion
    ndkVersion = flutter.ndkVersion

    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
        // Lo exige flutter_local_notifications: usa clases de java.time que en Android
        // antiguos no existen, y el desugaring las trae dentro del propio APK. Sin esto la
        // compilación falla con un error que no menciona las notificaciones por ningún lado.
        isCoreLibraryDesugaringEnabled = true
    }

    defaultConfig {
        applicationId = "es.fitlog.fitlog"
        // 23 (Android 6) es lo que pide el desugaring de las notificaciones. Cubre
        // cualquier móvil de la última década.
        minSdk = 23
        targetSdk = flutter.targetSdkVersion
        versionCode = flutter.versionCode
        versionName = flutter.versionName
    }

    buildTypes {
        release {
            // Se firma con la clave de depuración a propósito: esto no va a Google Play, se
            // instala a mano en el móvil de casa. Para publicarlo habría que crear un
            // almacén de claves propio y referenciarlo aquí.
            signingConfig = signingConfigs.getByName("debug")
        }
    }
}

dependencies {
    coreLibraryDesugaring("com.android.tools:desugar_jdk_libs:2.1.5")
}

kotlin {
    compilerOptions {
        jvmTarget = org.jetbrains.kotlin.gradle.dsl.JvmTarget.JVM_17
    }
}

flutter {
    source = "../.."
}
