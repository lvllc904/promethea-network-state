import { cartographerService } from './services/cartographer-service';
async function test() {
   const html = await cartographerService.generateShadowHtml('/dashboard/treasury');
   console.log(html);
   process.exit(0);
}
test();
