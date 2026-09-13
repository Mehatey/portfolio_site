const {execFileSync}=require('child_process');process.chdir(__dirname);const m=(...a)=>execFileSync('magick',a);
m('ribbon-source.png','-crop','1052x1150+101+54','+repage','-resize','196x214','ribbon.png');
m('award-source.webp','-colorspace','gray','-crop','1186x673+206+116','+repage','-resize','156x','ink-mask.png');
m('-size','156x89','xc:#f4f4f4','ink-mask.png','-alpha','off','-compose','CopyOpacity','-composite','ink.png');
m('ribbon.png','ink.png','-geometry','+20+66','-compose','Over','-composite','ribbon-printed.png');
m('ribbon.png','-background','#000000','-shadow','32x5+3+6','shadow.png');
m('source.jpg','shadow.png','-geometry','+45-18','-compose','Over','-composite','shadow.png','-geometry','+259-18','-compose','Over','-composite','ribbon-printed.png','-geometry','+55-8','-compose','Over','-composite','ribbon-printed.png','-geometry','+269-8','-compose','Over','-composite','encoded-webby-cover.png');
m('encoded-webby-cover.png','-quality','95','encoded-webby-cover.webp');
m('encoded-webby-cover.png','-resize','390x','qa-mobile.png');
