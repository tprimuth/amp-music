import { gsap } from 'gsap';
import { calcWinsize, getRandomInteger } from './utils';
import GalleryItem from './galleryItem';
import LocomotiveScroll from 'locomotive-scroll';
import Splitting from "splitting";


Splitting();

const scroll = new LocomotiveScroll({
    el: document.querySelector('[data-scroll-container]'),
    smooth: true
});


let winsize = calcWinsize();
window.addEventListener('resize', () => winsize = calcWinsize());

export default class GalleryController {
    constructor(galleryEl) {
        this.DOM = {
            galleryEl: galleryEl,
            title: document.querySelector('.title')
        };
        this.DOM.titleChars = this.DOM.title.querySelectorAll('.char');
        this.titleCharsTotal = this.DOM.titleChars.length;
        this.DOM.galleryItemElems = [...this.DOM.galleryEl.querySelectorAll('.gallery__item')];
        this.galleryItems = [];
        this.DOM.galleryItemElems.forEach(el => this.galleryItems.push(new GalleryItem(el)));
        this.itemsTotal = this.galleryItems.length;

        this.intro();
    }
    intro() {

        const timeline = gsap.timeline().to(this.DOM.title, {
            duration: 1,
            ease: 'expo',
            startAt: {y: '10%'},
            y: '0%',
            opacity: 1
        }, 0);


        for (const [pos, item] of this.galleryItems.entries()) {
            timeline.set(item.DOM.img, {
                x: winsize.width/2 - item.imgRect.left - item.imgRect.width/2,
                y:  winsize.height/2 - item.imgRect.top - item.imgRect.height/2,
                scale: 0.6,
                rotation: getRandomInteger(-10,10),
                opacity: 1,
                delay: 0.2*pos
            }, 0);


            if ( pos === 0 ) {
                timeline.set(item.DOM.imgInner, {
                    scale: 1.8
                }, 0);
            }
        }


        const [firstImage, ...otherImages] = this.galleryItems.map(el => el.DOM.img);

        timeline
        .addLabel('startAnimation', '+=0')

        .add(() => {
            document.body.classList.remove('noscroll');
            scroll.update();
        }, 'startAnimation')
        

        .to(this.DOM.titleChars, {
            duration: 1,
            ease: 'expo',
            x: (pos, target) => {
                return -40*(Math.floor(this.titleCharsTotal/2)-pos);
            },
            opacity: 0,
            stagger: {from: 'center'}
        }, 'startAnimation')


        .to(otherImages, {
            duration: 1, 
            ease: 'power3',
            x: () => '+='+getRandomInteger(-200,200)+'%',
            y: () => '+='+getRandomInteger(-200,200)+'%',
            opacity: 0,
            rotation: () => getRandomInteger(-20,20)
        }, 'startAnimation')

        .to(otherImages, {
            duration: 0.5,
            ease: 'expo',
            startAt: {
                x: 0,
                y: 0,
                rotation: 0,
                scale: 0.8
            },
            scale: 1,
            opacity: 1
        })


        .to(firstImage, {
            duration: 1.2,
            ease: 'expo',
            x: 0,
            y: 0,
            scale: 1,
            rotation: 0,
            opacity: 1
        }, 'startAnimation')

        .to(this.galleryItems[0].DOM.imgInner, {
            duration: 1.2,
            ease: 'expo',
            scale: 1
        }, 'startAnimation');


        for (const [pos, item] of this.galleryItems.entries()) {
            timeline
            .add( () => item.inStack = false, 'startAnimation+=1' )
            .to(item.DOM.captionChars, {
                duration: 2,
                ease: 'expo',
                startAt: {
                    opacity: 0,
                    x: pos => -40*(Math.floor(item.captionCharsTotal/2)-pos)
                },
                x: 0,
                opacity: 1,
                stagger: {from: 'center'}
            }, 'startAnimation')
            .to([item.DOM.caption.number,item.DOM.caption.texts], {
                duration: 1,
                ease: 'power1',
                startAt: {opacity: 0},
                opacity: 1,
                stagger: 0.04
            }, 'startAnimation+=0.3')
        }
    }
}