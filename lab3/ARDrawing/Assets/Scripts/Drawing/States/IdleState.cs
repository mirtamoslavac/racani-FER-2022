using Microsoft.MixedReality.Toolkit.Utilities;

namespace Drawing.States
{
    public class IdleDrawingState : DrawingState
    {
        public IdleDrawingState(HandDrawer3D drawer) : base(drawer) { }

        public override void OnPinching(MixedRealityPose pinchPose) { }

        public override void OnPinchEnded() { }
    }
}
