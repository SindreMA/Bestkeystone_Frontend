<template>
    <div :style="`color: ${computedColor};`">
    <slot/>        
    </div>
</template>
<script>
export default {
    props: ['faction'],
    computed: {
        computedColor() {
            if (this.faction) {
                if (this.faction.toLowerCase().charAt(0) === "a") {
                    return 'var(--faction-alliance)'
                } else {
                    return 'var(--faction-horde)'
                }
                return 'white'
            } else {
            }
        }
    },
}
</script>
