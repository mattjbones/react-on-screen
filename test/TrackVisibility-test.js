import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import { shallow, mount } from 'enzyme';
import { expect } from 'chai';
import sinon from 'sinon';
import TrackVisibility from './../src/TrackVisibility';

const hasProp = (Component, prop) => {
 return {}.hasOwnProperty.call(Component, prop);
};

describe('<TrackVisibility />', () => {

  describe('When rendering the component', ()=> {

    let oldGBCR;
    beforeEach(()=>{
      oldGBCR = window.HTMLDivElement.prototype.getBoundingClientRect;
    });

    afterEach(()=>{
       window.HTMLDivElement.prototype.getBoundingClientRect = oldGBCR;
    })

    it('Can be rendered without children', () => {
      const wrapper = shallow(<TrackVisibility />);
      expect(wrapper.equals(<div></div>)).to.equal(true);
    });

    it('Calls componentDidMount', () => {
      sinon.spy(TrackVisibility.prototype, 'componentDidMount');
      mount(<TrackVisibility />);
      expect(TrackVisibility.prototype.componentDidMount.calledOnce).to.equal(true);
    });

    it('Allows us to set props', () => {
      const wrapper = mount(<TrackVisibility bar="baz" />);
      expect(wrapper.props().bar).to.equal("baz");
      wrapper.setProps({ bar: "foo" });
      expect(wrapper.props().bar).to.equal("foo");
    });

    it('Throws an error if throttleInterval is not a valid integer >= 0', () => {
      const stub = sinon.stub(console, 'error');
      [-1, 'dsqdqsqs', 1.10].forEach((v) => {
        shallow(<TrackVisibility throttleInterval={v}/>);
        expect(stub.calledOnce).to.equal(true);
        expect(stub.firstCall.args[0]).to.equal('Warning: Failed prop type: The throttleInterval prop you provided to TrackVisibility is not a valid integer >= 0.\n    in TrackVisibility');
      });
      console.error.restore();
    });

    it('Should have isVisible state set to false', () => {
      const wrapper = shallow(<TrackVisibility />);
      expect(wrapper.state('isVisible')).to.equal(false);
    });

    it('Should pass isVisible to children as prop', () => {
      const wrapper = shallow(
        <TrackVisibility>
          <div />
        </TrackVisibility>
      );
      expect(hasProp(wrapper.children().props(), 'isVisible')).to.equal(true);
    });

    it('Should transfer all the props provided to children but omit own props [once, throttleInterval, className, style]', () => {
      const wrapper = shallow(
        <TrackVisibility foo="bar" baz="foobar" once={true}>
          <div />
        </TrackVisibility>
      );
      const props = wrapper.children().props();
      expect(hasProp(props, 'foo')).to.equal(true);
      expect(hasProp(props, 'baz')).to.equal(true);
      expect(hasProp(props, 'isVisible')).to.equal(true);
      expect(props.once).to.not.exist;
    });

    it('Should pass isVisible false as child is off screen',  () => {

      window.HTMLDivElement.prototype.getBoundingClientRect = () => ({
        top: -1,
        bottom: -2,
        right: -2,
        left: -1
      });

      const wrapper = mount(
        <TrackVisibility foo="bar" baz="foobar">
          <div />
        </TrackVisibility>
      );
      const props = wrapper.children().props();
      expect(props.isVisible).to.equal(false);
      expect(props.isPartiallyVisible).to.equal(false);
    });

    it('Should only pass isPartiallyVisible true as child is partially visible bottom/left',  () => {

      const height = (window.innerHeight || html.clientHeight);
      const width = (window.innerWidth || html.clientWidth);
      // 2x2 square drawn at height-1,-1
      window.HTMLDivElement.prototype.getBoundingClientRect = () => ({
        top: height-1,
        bottom: height+1,
        right: +1,
        left: -1
      });

      const wrapper = mount(
        <TrackVisibility foo="bar" baz="foobar">
          <div />
        </TrackVisibility>
      );
      const props = wrapper.children().props();
      expect(props.isVisible).to.equal(false);
      expect(props.isPartiallyVisible).to.equal(true);
    });

    it('Should only pass isPartiallyVisible true as child is partially visible bottom/right',  () => {

      const height = (window.innerHeight || html.clientHeight);
      const width = (window.innerWidth || html.clientWidth);
      // 2x2 square drawn at height-1,width-1
      window.HTMLDivElement.prototype.getBoundingClientRect = () => ({
        top: height-1,
        bottom: height+1,
        right: width+1,
        left: width-1
      });

      const wrapper = mount(
        <TrackVisibility foo="bar" baz="foobar">
          <div />
        </TrackVisibility>
      );
      const props = wrapper.children().props();
      expect(props.isVisible).to.equal(false);
      expect(props.isPartiallyVisible).to.equal(true);
    });

    it('Should only pass isPartiallyVisible true as child is partially visible top/right',  () => {

      const height = (window.innerHeight || html.clientHeight);
      const width = (window.innerWidth || html.clientWidth);
      // 2x2 square drawn at -1,width-1
      window.HTMLDivElement.prototype.getBoundingClientRect = () => ({
        top: -1,
        bottom: 1,
        right: width+1,
        left: width-1
      });

      const wrapper = mount(
        <TrackVisibility foo="bar" baz="foobar">
          <div />
        </TrackVisibility>
      );
      const props = wrapper.children().props();
      expect(props.isVisible).to.equal(false);
      expect(props.isPartiallyVisible).to.equal(true);
    });

    it('Should only pass isPartiallyVisible true as child is partially visible top/left',  () => {
      // 2x2 square drawn at -1,-1
      window.HTMLDivElement.prototype.getBoundingClientRect = () => ({
        top: -1,
        bottom: 1,
        right: 1,
        left: -1
      });

      const wrapper = mount(
        <TrackVisibility foo="bar" baz="foobar">
          <div />
        </TrackVisibility>
      );
      const props = wrapper.children().props();
      expect(props.isVisible).to.equal(false);
      expect(props.isPartiallyVisible).to.equal(true);
    });

    it('Should pass isVisible true (and partially visible false) as child is fully visible',  () => {
      // 1x1 square drawn at 1,1
      window.HTMLDivElement.prototype.getBoundingClientRect = () => ({
        top: 1,
        bottom: 2,
        right: 2,
        left: 1
      });

      const wrapper = mount(
        <TrackVisibility foo="bar" baz="foobar">
          <div />
        </TrackVisibility>
      );
      const props = wrapper.children().props();
      expect(props.isVisible).to.equal(true);
      expect(props.isPartiallyVisible).to.equal(false);
    });

		it('Should pass isVisible true as child fills viewport', () => {
			let width = window.innerWidth;
			let height = window.innerHeight;
      window.HTMLDivElement.prototype.getBoundingClientRect = () => ({
        top: 0,
        bottom: height,
        right: width,
        left: 0
      });

      const wrapper = mount(
        <TrackVisibility foo="bar" baz="foobar">
          <div />
        </TrackVisibility>
      );
      const props = wrapper.children().props();
      expect(props.isVisible).to.equal(true);
      expect(props.isPartiallyVisible).to.equal(false);

		});

    it('Store the result of the ref callback into this.nodeRef', () => {
      const wrapper = mount(<TrackVisibility />);
      expect(wrapper.instance().nodeRef).to.be.object;
    });

    it('Can update state', () => {
      const wrapper = mount(<TrackVisibility />);
      wrapper.setState({isVisible: true});
      expect(wrapper.state('isVisible')).to.equal(true);
      wrapper.setState({isVisible: false});
      expect(wrapper.state('isVisible')).to.equal(false);

    });

    it('Shouldn\'t have offset prop by default', () => {
      const wrapper = shallow(<TrackVisibility />);
      const props = wrapper.props();
      expect(hasProp(props, 'offset')).to.equal(false);
    });

    it('Should have offset prop if set', () => {
      const wrapper = shallow(<TrackVisibility offset={500} />);
      const props = wrapper.props();
      expect(hasProp(props, 'offset')).to.equal(true);
      expect(props.offset).to.equal(500);
    });
  });
});
