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

    // La clave con la que se firma el APK, y va **dentro del repositorio** a propósito.
    //
    // Android identifica una aplicación por su firma: un APK firmado con otra clave no es
    // «una versión nueva de FitLog», es otra aplicación, y al instalarlo encima dice
    // «aplicación no instalada». La única salida sería desinstalar primero, lo que borra
    // todos los entrenos. Antes esto se firmaba con la clave de depuración, que GitHub genera
    // **nueva en cada máquina**: cada APK compilado allí era, para Android, una aplicación
    // distinta de la anterior. Es decir, actualizar costaba el historial.
    //
    // Con la clave aquí, todos los APK que salgan de este repositorio —ahora y en tres años—
    // se instalan encima del anterior y los datos siguen en su sitio.
    //
    // Y lo que hay que saber del otro lado: esta clave no es un secreto y no protege nada
    // frente a quien tenga acceso al repositorio. Quien la tenga puede firmar un APK que el
    // móvil aceptaría como actualización de FitLog — pero para que eso importe tendría que
    // conseguir además que se instalara en el teléfono, y estos APK se instalan a mano.
    // Si algún día esto va a Play Store, la clave tiene que salir de aquí y pasar a los
    // secretos de GitHub: ahí sí protege algo, porque es lo que demuestra que una
    // actualización viene del mismo autor.
    signingConfigs {
        create("fitlog") {
            storeFile = file("fitlog.jks")
            storePassword = "fitlog"
            keyAlias = "fitlog"
            keyPassword = "fitlog"
        }
    }

    buildTypes {
        release {
            signingConfig = signingConfigs.getByName("fitlog")
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
