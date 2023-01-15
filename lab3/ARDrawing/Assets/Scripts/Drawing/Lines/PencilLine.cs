using System;
using Microsoft.MixedReality.Toolkit.Utilities;
using Drawing.Lines.Types;
using UnityEngine;

namespace Drawing.Lines
{
    public class PencilLine : Line
    {
        public event EventHandler PointAdded;
        
        public PencilLine(LineType lineType) : base(lineType) { }

        public override void StartLine(MixedRealityPose pinchPose, Material material, float radius)
        {
            base.StartLine(pinchPose, material, radius);
            PointAdded?.Invoke(this, EventArgs.Empty);
        }
        public override void UpdateLine(MixedRealityPose pinchPose)
        {
            base.UpdateLine(pinchPose);
            PointAdded?.Invoke(this, EventArgs.Empty);
        }

    }
}
