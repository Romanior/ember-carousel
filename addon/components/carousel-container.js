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

  activeIndex: reads('activeCarouselItem.index'),

  didUpdateAttrs() {
    this.whenActiveIndexChanged();
  },

  didInsertElement() {
    this.whenActiveIndexChanged();
  },

  whenActiveIndexChanged() {
    let activeIndex = this.get('activeIndex');
    let items = this.get('carouselItems');

    if (activeIndex && items.length && (activeIndex < items.length)) {
      let item = items.objectAt(activeIndex);
      this.jumpToItem(item, this.get('activeCarouselItem'));
    }
  },

  slide(newActiveIndex, direction, transitionInterval, transitionOffset = get(this, 'transitionInterval') / 2) {
    let carouselItems = get(this, 'carouselItems');
    let activeCarouselItem = get(this, 'activeCarouselItem');
    let newActiveCarouselItem = carouselItems[newActiveIndex];

    run(() => {
      set(activeCarouselItem, 'from', direction);
      set(newActiveCarouselItem, 'from', direction);
    });

    later(() => {
      set(activeCarouselItem, 'slidingOut', true);
      set(newActiveCarouselItem, 'slidingIn', true);
    }, transitionOffset);

    later(() => {
      this.set('activeIndex', newActiveIndex);

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

    }, (transitionInterval + transitionOffset));
  },

  jumpToItem(item, activeItem) {
    activeItem.set('isActive', false);
    item.set('isActive', true);
  },

  slideRight(transitionInterval = get(this, 'transitionInterval')) {
    let direction = 'right';
    let activeIndex = get(this, 'activeIndex');
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

    this.slide(newActiveIndex, direction, transitionInterval);
  },

  slideLeft(transitionInterval = get(this, 'transitionInterval')) {
    let direction = 'left';
    let activeIndex = get(this, 'activeIndex');
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

    this.slide(newActiveIndex, direction, transitionInterval);
  },

  actions: {
    jumpTo(item) {
      let activeCarouselItem = this.get('activeCarouselItem');
      this.jumpToItem(item, activeCarouselItem);
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
