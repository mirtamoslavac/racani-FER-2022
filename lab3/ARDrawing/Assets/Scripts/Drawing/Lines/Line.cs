using System.Collections.Generic;
using Microsoft.MixedReality.Toolkit.Utilities;
using Drawing.Lines.Types;
using UnityEngine;

namespace Drawing.Lines
{
    public abstract class Line
    {
        private readonly LineType _lineType;

        protected Line(LineType lineType)
        {
            _lineType = lineType;
        }

        public virtual void StartLine(MixedRealityPose pinchPose, Material material, float radius) => _lineType.StartLine(pinchPose, material, radius);
        public virtual void UpdateLine(MixedRealityPose pinchPose) => _lineType.UpdateLine(pinchPose);
        public void EndLine() => _lineType.EndLine();
        
        public void RemoveLine() => _lineType.Remove();

        public List<Vector3> GetPoints() => _lineType.GetLineWorldPoints();
    }
}
