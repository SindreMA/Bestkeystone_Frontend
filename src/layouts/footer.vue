<template>
    <div id="pageFooter" class="lineBackground shadow-24">
        <div class=" Container">
          <div class="TextBox">
            <h5>Bestkeystone.com</h5>
            <br>
            <p>Bringing you keystone statistics since 2018</p>
            <p>© 2023 @SindreMA. All right reserved.</p>
          </div>
          <div class="gap-10 socials flex column">
            <div v-for="(social, index) in socials" :key="index" class="text-center flex flex-row gap-15 flex-center justify-between" >
              <p class="no-margin" >{{ social.label }}</p>
              <a :href="social.link" target="_blank" class="socialItem" :style="{backgroundColor: social.bg}">
                <img :src="social.icon" alt="social icon" width="30px" height="30px" />
              </a>
            </div>

          </div>


        </div>
    </div>
</template>

<script lang="ts" setup>

const socials = [
  {
    link: 'https://discord.gg/rxU5SRZnd3',
    icon: 'https://res.cloudinary.com/djpcbbeqx/image/upload/v1668114131/Social/cnw8pghmenash6pnsp1x.png',
    label: 'Discord',
    bg: '#5865F2'
  },
  {
    link: 'https://github.com/SindreMA/Bestkeystone_Frontend',
    icon: 'https://res.cloudinary.com/djpcbbeqx/image/upload/v1678312407/Social/sduczryz3mefotbzxzlp.png',
    label: 'Github',
    bg: '#333'
  }
]

</script>


<style scoped>
.socials {
  color: white;
}
h5 {
  margin: 0px !important;
}
.TextBox {
  height: 100%;
  color: white;
  font-weight: 500;
  display: flex;
  flex-direction: column;
}

#pageFooter {
  width: 100%;
  height: 160px;
  bottom: 0px;
  display: flex;
  justify-content: center;
  align-items: center;


}
.Container {
  width: 100%;
  max-width: 1300px;
  padding: 10px 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 15px
}

.socialItem {
  width: 50px;
  height: 50px;
  border-radius: 13px;

  display: flex;
  justify-content: center;
  align-items: center;
}
.socialItem:hover {
    cursor: pointer;
    opacity: 0.8;
}

.socialItem a {

  display: flex;
  justify-content: center;
  align-items: center;
}
img {
  width: 70%;
  height: 70%;
  object-fit: contain;
}
</style>
