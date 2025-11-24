plugins {
    kotlin("jvm") version "2.2.20"
    id("org.gauge") version "2.3.0"
}

group = "gauge-kotlin-gradle"
version = "1.0-SNAPShoT"

repositories {
    mavenCentral()
}

dependencies {
    testImplementation(libs.gaugeJava)
    testImplementation(libs.playwright)
    testImplementation(kotlin("test"))
    testImplementation(libs.hopliteCore)
    testImplementation(libs.hopliteToml)
}

kotlin {
    jvmToolchain(24)
}

gauge {
    specsDir = "specs"
    tags = ""
    additionalFlags = "--verbose"
}

tasks.named<Test>("test") {
    dependsOn("gauge")
    testClassesDirs = files()
    classpath = files()
}
