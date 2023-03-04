import VueFrappe from 'vue2-frappe';
import {ServerTable, ClientTable, Event} from 'vue-tables-2';

export default ({ Vue }) => {
  Vue.use(VueFrappe)
  Vue.use(ClientTable);

}
