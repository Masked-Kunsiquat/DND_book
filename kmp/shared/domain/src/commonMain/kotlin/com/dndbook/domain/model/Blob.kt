package com.dndbook.domain.model

import kotlinx.serialization.Serializable

/**
 * Content-addressed binary object.
 * The [hash] is the SHA-256 hex digest of the content and serves as the primary key.
 */
@Serializable
data class Blob(
    val hash: String,
    val extension: String,
    val size: Long,
    val created: String,
)
