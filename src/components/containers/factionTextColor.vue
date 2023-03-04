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
                    return '#027be3'
                } else {
                    return '#b30000'
                }
                return 'white'
            } else {
            }
        }
    },
}
</script>
