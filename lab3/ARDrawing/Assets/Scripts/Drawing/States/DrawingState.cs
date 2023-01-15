using Microsoft.MixedReality.Toolkit.Utilities;
using Drawing.Lines.Types.Enums;
using UnityEngine;

namespace Drawing.States
{
    public abstract class DrawingState
    {
        protected HandDrawer3D _drawer;
        
        public LineTypes CurrentLineType { get; set; }
        public Material CurrentMaterial { get; set; }
        public float CurrentRadius { get; set; }

        protected DrawingState(HandDrawer3D drawer)
        {
            _drawer = drawer;
        }

        public abstract void OnPinching(MixedRealityPose pinchPose);
        
        public abstract void OnPinchEnded();
    }
}
