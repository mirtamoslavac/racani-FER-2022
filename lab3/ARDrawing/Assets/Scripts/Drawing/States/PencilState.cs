using Microsoft.MixedReality.Toolkit.Utilities;
using Drawing.Lines;
using Drawing.Lines.Types;
using UnityEngine;

namespace Drawing.States
{
    public class PencilState : DrawingState
    {
        private PencilLine _currentLine; 
        
        public PencilState(HandDrawer3D drawer) : base(drawer) { }
        
        public override void OnPinching(MixedRealityPose pinchPose)
        {
            if (_currentLine == null)
            {
                _currentLine = new PencilLine(LineType.CreateLineType(this.CurrentLineType, _drawer.LinePrefab, _drawer.DotPrefab, _drawer.LineParentGameObject));
                _currentLine?.StartLine(pinchPose, CurrentMaterial, CurrentRadius);
                _drawer.AddStartedPencilLine(_currentLine);
            }
            _currentLine?.UpdateLine(pinchPose);
        }

        public override void OnPinchEnded()
        {
            _currentLine?.EndLine();
            _drawer.AddFinishedPencilLine(_currentLine);
            _currentLine = null;
        }
    }
}
