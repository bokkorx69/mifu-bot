"use strict";

const axios=require("axios");
const fs=require("fs-extra");
const path=require("path");

module.exports={
config:{
 name:"edit",
 aliases:["eall","multiedit","i2i"],
 version:"6.4.0",
 author:"Bokkor x69",
 countDown:5,
 role:0,
 category:"VIP"
},

onStart:async({message,event,args,api})=>{

 const API="https://api.nazrul.run.place/nazrul/editEm";
 const KEY="napi_00109790837e441b30b52b93d0ae01b6d570cfb42108c139785d1a5ad2153f80";

 const modelList=[
  ["10224","GPT Image 2","gpt2"],
  ["10135","GPT Image 1.5","gpt15"],
  ["10002","GPT-4o","gpt4o"],
  ["10171","Nano Banana 2","nano2"],
  ["10093","Nano Banana Pro","nanopro"],
  ["10041","Nano Banana","nano"],
  ["10500","Nano Banana 2 Lite","nano2lite"],
  ["10501","Grok Image 2","grok"],
  ["10255","Seedream 5.0 Pro","seedream5"],
  ["10169","Seedream 5.0 Lite","seedream5lite"],
  ["10147","Seedream 4.5","seedream45"],
  ["10042","Seedream 4.0","seedream4"],
  ["10127","Kling O1 Image","kling"],
  ["10031","Midjourney Image","midjourney"],
  ["10221","Wan 2.7 Image Pro","wan27pro"],
  ["10220","Wan 2.7 Image","wan27"],
  ["10083","Wan 2.5 Image","wan25"],
  ["10084","Qwen Image","qwen"],
  ["10148","Qwen Image 2512","qwen2512"],
  ["10168","Qwen Image 2.0","qwen2"],
  ["10800","Qwen Image 3.0","qwen3"],
  ["10801","Qwen Image 3.0 Pro","qwen3pro"],
  ["10104","FLUX 2 Pro","flux2pro"],
  ["10105","FLUX 2 Flex","flux2flex"],
  ["10003","FLUX Kontext Pro","kontext"],
  ["10008","FLUX Kontext Max","kontextmax"],
  ["10067","Hunyuan Image 3","hunyuan"]
 ];

 const modelMap={};

 for(const [id,name,short] of modelList){
  modelMap[id]=id;
  modelMap[name.toLowerCase()]=id;
  modelMap[short]=id;
 }

 const cacheDir=path.join(__dirname,"cache");

 await fs.ensureDir(cacheDir);

 const first=args[0]?.toLowerCase();

 if(first==="list"||first==="-list"||first==="--list"){

  let text=`╭━━━〔 𝐄𝐃𝐈𝐓 𝐌𝐎𝐃𝐄𝐋𝐒 〕━━━╮
│
`;

  modelList.forEach(([id,name,short],i)=>{

   const num=String(i+1).padStart(2,"0");

   text+=`│ ${num} • ${name}
│      𝐔𝐬𝐞: -${short}
│
`;
  });

  text+=`╰━━━━━━━━━━━━━━━━━━━━━━╯
𝐄𝐱𝐚𝐦𝐩𝐥𝐞:
𝐞𝐝𝐢𝐭 𝐜𝐢𝐧𝐞𝐦𝐚𝐭𝐢𝐜 -𝐧𝐚𝐧𝐨𝟐`;

  return message.reply(text);
 }

 const img=event.messageReply?.attachments?.[0];

 if(!img?.url)
  return message.reply("❌ 𝐑𝐞𝐩𝐥𝐲 𝐭𝐨 𝐚𝐧 𝐢𝐦𝐚𝐠𝐞.");

 let quality="1K";
 let model="10224";
 let aspectRatio="Auto";
 let promptArgs=[];

 for(let i=0;i<args.length;i++){

  const arg=args[i];
  const low=arg.toLowerCase();

  if((low==="-q"||low==="--q")&&args[i+1]){

   quality=args[++i].toUpperCase();
   continue;

  }

  if((low==="-r"||low==="--r")&&args[i+1]){

   aspectRatio=args[++i];
   continue;

  }

  if((low==="-m"||low==="--m")&&args[i+1]){

   const value=args[++i].toLowerCase();

   if(!modelMap[value])
    return message.reply(
     "❌ 𝐈𝐧𝐯𝐚𝐥𝐢𝐝 𝐦𝐨𝐝𝐞𝐥.\n𝐔𝐬𝐞: 𝐞𝐝𝐢𝐭 -𝐥𝐢𝐬𝐭"
    );

   model=modelMap[value];
   continue;

  }

  if(
   low.startsWith("-")&&
   modelMap[low.slice(1)]
  ){

   model=modelMap[low.slice(1)];
   continue;

  }

  promptArgs.push(arg);
 }

 const prompt=promptArgs.join(" ").trim();

 if(!prompt)
  return message.reply(
   "❌ 𝐆𝐢𝐯𝐞 𝐚𝐧 𝐞𝐝𝐢𝐭𝐢𝐧𝐠 𝐩𝐫𝐨𝐦𝐩𝐭."
  );

 if(!["1K","2K","4K"].includes(quality))
  return message.reply(
   "❌ 𝐐𝐮𝐚𝐥𝐢𝐭𝐲: 𝟏𝐊 / 𝟐𝐊 / 𝟒𝐊"
  );

 if(
  ![
   "Auto",
   "1:1",
   "4:3",
   "3:4",
   "16:9",
   "9:16",
   "3:2",
   "2:3"
  ].includes(aspectRatio)
 ){
  return message.reply(
   "❌ 𝐈𝐧𝐯𝐚𝐥𝐢𝐝 𝐚𝐬𝐩𝐞𝐜𝐭 𝐫𝐚𝐭𝐢𝐨."
  );
 }

 const selected=modelList.find(
  x=>x[0]===model
 );

 api.setMessageReaction(
  "⏳",
  event.messageID,
  ()=>{},
  true
 );

 let tempFile=null;
 let imageStream=null;

 try{

  const res=await axios.get(API,{

   headers:{
    "x-api-key":KEY
   },

   params:{
    imageUrl:img.url,
    prompt:prompt,
    aspectRatio:aspectRatio,
    quality:quality,
    model:model
   },

   timeout:180000
  });

  const data=res.data;

  if(!data?.status)
   throw new Error(
    data?.message||"API request failed"
   );

  const url=data?.image_url||data?.response;

  if(!url)
   throw new Error(
    "No image URL returned"
   );

  console.log(
   "EDIT IMAGE URL:",
   url
  );

  /* DOWNLOAD IMAGE */

  const imageRes=await axios.get(url,{

   responseType:"arraybuffer",

   timeout:180000,

   headers:{
    "User-Agent":"Mozilla/5.0",
    "Accept":"image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8"
   }
  });

  const contentType=
   imageRes.headers["content-type"]||"";

  const imageBuffer=
   Buffer.from(imageRes.data);

  console.log(
   "IMAGE CONTENT TYPE:",
   contentType
  );

  console.log(
   "IMAGE SIZE:",
   imageBuffer.length
  );

  if(
   !contentType.startsWith("image/")
  ){
   throw new Error(
    `Invalid response type: ${contentType}`
   );
  }

  if(imageBuffer.length<1000)
   throw new Error(
    "Image response is too small"
   );

  /* FILE EXTENSION */

  let ext="png";

  if(contentType.includes("jpeg"))
   ext="jpg";

  else if(contentType.includes("webp"))
   ext="webp";

  else if(contentType.includes("gif"))
   ext="gif";

  else if(contentType.includes("png"))
   ext="png";

  const fileName=
   `edit_${Date.now()}_${Math.random()
    .toString(36)
    .slice(2)}.${ext}`;

  tempFile=path.join(
   cacheDir,
   fileName
  );

  console.log(
   "DOWNLOADING TO CACHE:",
   tempFile
  );

  await fs.writeFile(
   tempFile,
   imageBuffer
  );

  const stat=await fs.stat(tempFile);

  if(stat.size<1000)
   throw new Error(
    "Downloaded image file is invalid"
   );

  console.log(
   "IMAGE SAVED:",
   tempFile,
   "SIZE:",
   stat.size
  );

  /* CREATE STREAM */

  imageStream=fs.createReadStream(
   tempFile
  );

  await message.reply({

   body:
`𝐇𝐞𝐫𝐞 𝐘𝐨𝐮𝐫 𝐄𝐝𝐢𝐭𝐞𝐝 𝐈𝐦𝐚𝐠𝐞 ✅

╭─❖ 𝐄𝐃𝐈𝐓 𝐃𝐄𝐓𝐀𝐈𝐋𝐒 ❖─╮
│ 𝐌𝐨𝐝𝐞𝐥: ${selected?.[1]||"𝐆𝐏𝐓 𝐈𝐦𝐚𝐠𝐞 𝟐"}
│ 𝐐𝐮𝐚𝐥𝐢𝐭𝐲: ${quality}
│ 𝐑𝐚𝐭𝐢𝐨: ${aspectRatio}
╰────────────────╯`,

   attachment:imageStream

  });

  api.setMessageReaction(
   "✅",
   event.messageID,
   ()=>{},
   true
  );

 }catch(error){

  console.error(
   "EDIT ERROR:",
   error.response?.data||
   error.message
  );

  api.setMessageReaction(
   "❌",
   event.messageID,
   ()=>{},
   true
  );

  return message.reply(
`❌ 𝐈𝐦𝐚𝐠𝐞 𝐞𝐝𝐢𝐭 𝐟𝐚𝐢𝐥𝐞𝐝.

𝐑𝐞𝐚𝐬𝐨𝐧: ${
 error.response?.data?.message||
 error.message||
 "𝐔𝐧𝐤𝐧𝐨𝐰𝐧 𝐞𝐫𝐫𝐨𝐫"
}`
  );

 }finally{

  /* CLOSE STREAM */

  try{

   if(imageStream)
    imageStream.destroy();

  }catch(e){}

  /* DELETE CACHE FILE */

  try{

   if(
    tempFile&&
    await fs.pathExists(tempFile)
   ){

    await fs.remove(tempFile);

    console.log(
     "CACHE IMAGE DELETED:",
     tempFile
    );

   }

  }catch(e){

   console.error(
    "CACHE CLEANUP ERROR:",
    e.message
   );

  }
 }
}
};