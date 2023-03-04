<template>
    <slot :link="formattedUrl" />
</template>

<script lang="ts" setup>
import SF from 'components/../SharedFunctions'
import { computed, toRefs } from 'vue';

const props = defineProps({
    url: String,
    quality: [Number, String],
    size: [Number, String],
    format: String
})

const { url,  quality, size, format } = toRefs(props)

const formattedUrl = computed(() => SF.FormatToCloudinary(url.value, quality.value, size.value, format.value))

</script>