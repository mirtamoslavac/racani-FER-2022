using System.Collections.Generic;
using LineRenderer.LineRenderer3D;
using Microsoft.MixedReality.Toolkit.Utilities;
using System.Linq;
using Drawing.Lines.Types.Enums;
using UnityEngine;
using Object = UnityEngine.Object;

namespace Drawing.Lines.Types
{
    public abstract class LineType
    {
        protected LineRenderer3D _lineRenderer;

        private readonly GameObject _linePrefab;
        private readonly GameObject _dotPrefab;
        private readonly GameObject _parentObject;

        private GameObject _line;
        private GameObject _dot;

        private const float MinimumDistanceBetweenPoints = 0.01f;

        protected LineType(GameObject linePrefab, GameObject dotPrefab, GameObject parentObject)
        {
            _linePrefab = linePrefab;
            _dotPrefab = dotPrefab;
            _parentObject = parentObject;
        }

        public void StartLine(MixedRealityPose pinchPose, Material material, float radius)
        {
            _line = Object.Instantiate(_linePrefab, pinchPose.Position, pinchPose.Rotation, _parentObject.transform);
            _line.GetComponent<MeshRenderer>().material = material;
            _lineRenderer = _line.GetComponent<LineRenderer3D>();
            _lineRenderer.pipeMeshSettings.radius = radius;

            Vector3 worldPoint = _lineRenderer.transform.InverseTransformPoint(pinchPose.Position);
            AddPointToLine(worldPoint);

            _dot = Object.Instantiate(_dotPrefab, pinchPose.Position, pinchPose.Rotation, _parentObject.transform);
            float diameter = _lineRenderer.pipeMeshSettings.radius * 2;
            _dot.transform.localScale = Vector3.one * diameter;
            _dot.GetComponent<MeshRenderer>().material = material;
        }

        public void UpdateLine(MixedRealityPose pinchPose)
        {
            if (_lineRenderer == null) return;

            Vector3 worldPoint = _lineRenderer.transform.InverseTransformPoint(pinchPose.Position);
            if (!ShouldAddPointToLine(worldPoint)) return;
            AddPointToLine(worldPoint);
            
            if (_dot != null && _lineRenderer.pathData.positions.Count > 1) Object.Destroy(_dot);
        }

        public void EndLine()
        {
            if (_lineRenderer.pathData.positions.Count < 2)
            {
                Object.Destroy(_lineRenderer);
                Object.Destroy(_line);
            }
        }

        public void Remove()
        {
            if (_lineRenderer != null) Object.Destroy(_lineRenderer);
            if (_line != null) Object.Destroy(_line);
            if (_dot != null) Object.Destroy(_dot);
        }

        public List<Vector3> GetLineWorldPoints() => _lineRenderer.pathData.positions.Select(point => _lineRenderer.transform.TransformPoint(point)).ToList();

        public static LineType CreateLineType(LineTypes lineTypes, GameObject linePrefab, GameObject dotPrefab, GameObject parentObject)
        {
            switch (lineTypes)
            {
                case LineTypes.Straight: return new StraightLineType(linePrefab, dotPrefab, parentObject);
                case LineTypes.Freeform:
                default:
                    return new FreeformLineType(linePrefab, dotPrefab, parentObject);
            }
        }

        protected abstract void AddPointToLine(Vector3 point);

        private bool ShouldAddPointToLine(Vector3 currentPoint) => Vector3.Distance(currentPoint, _lineRenderer.pathData.positions.Last()) >= MinimumDistanceBetweenPoints;
    }
}
