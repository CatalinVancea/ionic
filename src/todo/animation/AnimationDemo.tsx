import React, { useEffect } from 'react';
import { createAnimation } from '@ionic/react';
import { MyComponent } from './MyComponent';
import './AnimationDemo.css';
import { MyModal } from './MyModal';

const AnimationDemo: React.FC = () => {
  useEffect(simpleAnimation, []);
  // useEffect(groupAnimations, []);
  useEffect(chainAnimations, []);
  return (
    <div className="container">
      <div className="square-a">
        <p>Test 1</p>
      </div>
      <div className="square-b">
        <p>Test 2</p>
      </div>
      <div className="square-c">
        <p>Test 3</p>
      </div>
      <MyComponent />
      <MyModal />
    </div>
  );

  function simpleAnimation() {
    const el = document.querySelector('.square-a');
    if (el) {
      const animation = createAnimation()
        .addElement(el)
        .duration(1000)
        .direction('alternate')
        .iterations(Infinity)
        .keyframes([
          { offset: 0, transform: 'scale(3)', opacity: '1' },
          {
            offset: 1, transform: 'scale(1.5)', opacity: '0.5'
          }
        ]);
      animation.play();
    }
  }

  function groupAnimations() {
    const elB = document.querySelector('.square-b');
    const elC = document.querySelector('.square-c');
    if (elB && elC) {
      const animationA = createAnimation()
        .addElement(elB)
        .fromTo('transform', 'scale(1)', 'scale(1.5)');
      const animationB = createAnimation()
        .addElement(elC)
        .fromTo('transform', 'scale(1)', 'scale(0.5)');
      const parentAnimation = createAnimation()
        .duration(10000)
        .addAnimation([animationA, animationB]);
      parentAnimation.play();    }
  }

  function chainAnimations() {
    const elB = document.querySelector('.square-b');
    const elC = document.querySelector('.square-c');
    if (elB && elC) {
      const animationA = createAnimation()
        .addElement(elB)
        .duration(5000)
        .fromTo('transform', 'scale(1)', 'scale(1.5)')
        .afterStyles({
          'background': 'green'
        });
      const animationB = createAnimation()
        .addElement(elC)
        .duration(7000)
        .fromTo('transform', 'scale(1)', 'scale(0.5)')
        .afterStyles({
          'background': 'green'
        });
        (async () => {
        await animationA.play();
        await animationB.play();
      })();
    }
  }
};

export default AnimationDemo;
