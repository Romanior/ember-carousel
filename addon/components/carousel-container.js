import Component from '@ember/component';
import { computed, get, set } from '@ember/object';
import { reads } from '@ember/object/computed';
import { run, later } from '@ember/runloop';
import layout from '../templates/components/carousel-container';
import { A } from '@ember/array';

export default Component.extend({
  classNames: ['carousel-container'],

  layout,
  transitionInterval: 400,
  totalCarouselItems: reads('carouselItems.length'),
  isAnimatedJump: true,

  init() {
    this._super(...arguments);
    set(this, 'carouselItems', A());
  },

  activeCarouselItem: computed('carouselItems.{length,@each.isActive}', function () {
    return get(this, 'carouselItems').findBy('isActive');
  }),

  slide(newActiveIndex, direction, transitionInterval, transitionOffset = 400, fnDone) {
    let carouselItems = get(this, 'carouselItems');
    let activeCarouselItem = get(this, 'activeCarouselItem');
    let newActiveCarouselItem = carouselItems[newActiveIndex];

    run(function() {
      set(activeCarouselItem, 'from', direction);
      set(newActiveCarouselItem, 'from', direction);
    });

    later(function() {
      set(activeCarouselItem, 'slidingOut', true);
      set(newActiveCarouselItem, 'slidingIn', true);
    }, transitionOffset);

    later(function() {
      activeCarouselItem.setProperties({
        slidingOut: false,
        from: null,
        isActive: false
      });

      newActiveCarouselItem.setProperties({
        slidingIn: false,
        from: null,
        isActive: true
      });

      fnDone && fnDone();
    }, (transitionInterval + transitionOffset));
  },

  jumpToItem(item, activeItem) {
    activeItem.set('isActive', false);
    item.set('isActive', true);
  },

  slideRight(transitionInterval = get(this, 'transitionInterval'), fnDone = () => {}) {
    let direction = 'right';
    let activeIndex = get(this, 'activeCarouselItem.index');
    let newActiveIndex = activeIndex - 1;

    if (activeIndex === 0) {
      newActiveIndex = get(this, 'totalCarouselItems') - 1;
    }

    if (get(this, 'onSlide')) {
      get(this, 'onSlide')({
        index: newActiveIndex,
        previousIndex: activeIndex,
        direction
      });
    }

    this.slide(newActiveIndex, direction, transitionInterval, fnDone);
  },

  slideLeft(transitionInterval = get(this, 'transitionInterval'), fnDone = () => {}) {
    let direction = 'left';
    let activeIndex = get(this, 'activeCarouselItem.index');
    let newActiveIndex = activeIndex + 1;

    if (activeIndex === (get(this, 'totalCarouselItems') - 1)) {
      newActiveIndex = 0;
    }

    if (get(this, 'onSlide')) {
      get(this, 'onSlide')({
        index: newActiveIndex,
        previousIndex: activeIndex,
        direction
      });
    }

    this.slide(newActiveIndex, direction, transitionInterval, fnDone);
  },

  actions: {
    slideTo(item) {
      let { carouselItems, activeCarouselItem, isAnimatedJump, transitionInterval } =
        this.getProperties('carouselItems', 'activeCarouselItem', 'isAnimatedJump', 'transitionInterval');

      if (!isAnimatedJump) {
        return this.jumpToItem(item, activeCarouselItem);
      }

      let currentActiveIndex = carouselItems.indexOf(activeCarouselItem);
      let targetIndex = carouselItems.indexOf(item);

      if (currentActiveIndex !== targetIndex) {
        let willSlidingRight = targetIndex > currentActiveIndex;
        let stepsToTarget = Math.abs(targetIndex - currentActiveIndex);
        let interval = Math.round(transitionInterval / stepsToTarget);
        let currentIndex = currentActiveIndex;


        for (let x = 0, ln = stepsToTarget; x < ln; x++) {

          this.slideLeft(20)

        }

      }
    },

    toRight() {
      return this.slideLeft();
    },

    toLeft() {
      return this.slideRight();
    },

    registerItem(item) {
      this.get('carouselItems').pushObject(item);
    }
  }
});
