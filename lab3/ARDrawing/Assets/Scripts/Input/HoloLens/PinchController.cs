using System;
using Microsoft.MixedReality.Toolkit.Utilities;
using UnityEngine;

namespace Lab3.Input.HoloLens
{
    public class PinchEventArgs : EventArgs
    {
        public MixedRealityPose PinchPose { get; set; }

        public PinchEventArgs(MixedRealityPose pinchPose)
        {
            PinchPose = pinchPose;
        }
    }

    public abstract class PinchController : MonoBehaviour
    {
        public EventHandler<PinchEventArgs> PinchingEventHandler;
        public EventHandler PinchEndedEventHandler;
    }
}
