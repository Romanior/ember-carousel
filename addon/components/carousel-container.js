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
  jumpIndex: 0,

  init() {
    this._super(...arguments);
    set(this, 'carouselItems', A());
  },

  activeCarouselItem: computed('carouselItems.{length,@each.isActive}', function () {
    return get(this, 'carouselItems').findBy('isActive');
  }),

  activeIndex: reads('activeCarouselItem.index'),

  didInsertElement() {
    this.jumpIndexChanged();
  },

  jumpIndexChanged() {
    let jumpIndex = this.get('jumpIndex');
    let items = this.get('carouselItems');

    if (jumpIndex && items.length && (jumpIndex < items.length)) {
      let item = items.objectAt(jumpIndex);
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
    this.set('activeIndex', this.get('carouselItems').indexOf(item));
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
      let jumpIndex = this.get('jumpIndex');
      let activeItem = this.get('activeCarouselItem')

      let items = this.get('carouselItems');

      this.get('carouselItems').pushObject(item);

      if (jumpIndex && items.length && (jumpIndex < items.length)) {
        this.jumpToItem(item, activeItem)
      }
    },

    unregisterItem(item) {
      let items = this.get('carouselItems');
      let activeCarouselItem = this.get('activeCarouselItem');
      let activeIndex = items.indexOf(activeCarouselItem);

      // make active element from left or right of removed
      let activeSibling = items.objectAt(activeIndex - 1) || items.objectAt(activeIndex + 1);
      activeSibling && this.jumpToItem(activeSibling, activeCarouselItem)

      this.set('activeIndex', items.indexOf(activeSibling));
      this.get('carouselItems').removeObject(item);
    }
  }
});
