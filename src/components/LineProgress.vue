<template>
<div>
    <br>
<div class="flex fullBorder fit justify-end content-stretch z10">
        <div v-for="i in 12" :key="i" :class="{unFilled : i > 5, filled : i <= 5, leftRadBorder : i == 1, rightRadBorder:  i == 12, leftBorder: i !== 1, rightBorder: i !== 12}" class="col-grow self-stretch text-center">

             {{i}}
        </div>
    </div>
    <br>
</div>
    
</template>

<script>
export default {
    props: ['max','value', 'line-color', 'outline-color','show-numbers','data']
    
}
</script>

<style>
    .filled {
        background-color: rgba(179, 121, 14, 0.781);
    }
    .leftRadBorder {
        border-radius:  20px  0px 0px 20px;
    }
        .rightRadBorder {
        border-radius:  0px  20px 20px 0px;
    }
    
        .leftBorder {
        border-left: solid 1px grey;
    }
        .rightBorder {
        border-right: solid 1px grey;
    }

    .unFilled { 
        background-color: rgba(148, 109, 38, 0.349);
        
    }
    .z10 {
        z-index: 10;
    }
</style>