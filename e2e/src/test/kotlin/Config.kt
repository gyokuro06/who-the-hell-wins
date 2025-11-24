import com.sksamuel.hoplite.ConfigLoaderBuilder
import com.sksamuel.hoplite.PropertySource
import java.net.URI

val config = ConfigLoaderBuilder.default()
    .addPropertySource(PropertySource.resource("/config.toml"))
    .addPropertySources(emptyList())
    .build()
    .loadConfigOrThrow<Config>()

data class Sut(
    val url: URI
)

data class Config(
    val sut: Sut
)