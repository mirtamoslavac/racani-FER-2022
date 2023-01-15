using Microsoft.MixedReality.Toolkit.Input;
using Microsoft.MixedReality.Toolkit.Utilities;
using System;
using UnityEngine;

namespace Lab3.Input.HoloLens
{
    public class BasicPinchController : PinchController
    {
        [SerializeField] private Handedness _handedness;
        [SerializeField] private float _pinchThreshold = .7f;

        private bool _pinching;

        private void Update()
        {
            try
            {
                IMixedRealityHand hand = HandJointUtils.FindHand(_handedness);
                float pinchStrength = HandPoseUtils.CalculateIndexPinch(hand.ControllerHandedness);
                if (pinchStrength >= _pinchThreshold && HandJointUtils.TryGetJointPose(TrackedHandJoint.IndexTip, hand.ControllerHandedness, out var indexPose))
                {
                    PinchingEventHandler?.Invoke(this, new PinchEventArgs(indexPose));
                    _pinching = true;
                }
                else if (_pinching)
                {
                    PinchEndedEventHandler?.Invoke(this, EventArgs.Empty);
                    _pinching = false;
                }
            }
            catch
            {
                if (_pinching)
                {
                    PinchEndedEventHandler?.Invoke(this, EventArgs.Empty);
                    _pinching = false;
                }

            }
        }
    }
}